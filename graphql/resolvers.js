const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLBoolean
} = require("graphql");

const { Post, Like, Rating, Comment, User } = require("../models");
const { logToFile } = require("../utils/logger");

const {
  UserType,
  AuthPayloadType,
  UserInputType,
  PostType,
  PostInputType,
  CommentType,
  CommentInputType
} = require("./types");

const JWT_SECRET = process.env.JWT_SECRET;

// Helpers to check auth in mutations/queries
function ensureAuth(context) {
  const auth = context.req.headers.authorization;
  if (!auth) throw new Error("No token provided");
  const token = auth.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Invalid/expired token");
  }
}

const RootQuery = {
  commentsByPost: {
    type: new GraphQLList(CommentType),
    args: {
      postId: { type: new GraphQLNonNull(GraphQLID) }
    },
    resolve: async (_, { postId }, context) => {
      ensureAuth(context);
      logToFile(`Fetched comments for post ${postId}`);
      const comments = await Comment.findAll({
        where: { postId, parentCommentId: null },
        include: [{ model: Comment, as: "replies" }],
        order: [["createdAt", "DESC"]]
      });
      return comments;
    }
  },

  post: {
    type: PostType,
    args: { id: { type: GraphQLID } },
    resolve: async (_, { id }, context) => {
      const decoded = ensureAuth(context);
      const post = await Post.findByPk(id);
      if (!post) throw new Error("Post not found");
      if (decoded.role !== "admin" && post.userId !== decoded.id) {
        throw new Error("Access denied.");
      }
      logToFile(`Fetched post ${id} by user ${decoded.id}`);
      return post;
    }
  },

  posts: {
    type: new GraphQLList(PostType),
    resolve: async (_, __, context) => {
      const decoded = ensureAuth(context);
      if (decoded.role !== "admin") throw new Error("Admins only");
      logToFile(`Admin ${decoded.id} fetched all posts`);
      return await Post.findAll();
    }
  },

  users: {
    type: new GraphQLList(UserType),
    resolve: async (_, __, context) => {
      const decoded = ensureAuth(context);
      if (decoded.role !== "admin") throw new Error("Admins only");
      logToFile(`Admin ${decoded.id} fetched all users`);
      return await User.findAll({
        attributes: { exclude: ["password", "session", "tokenExpiration"] }
      });
    }
  },

  user: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve: async (_, { id }, context) => {
      const decoded = ensureAuth(context);
      const searchId = decoded.role === "admin" && id ? id : decoded.id;
      const user = await User.findByPk(searchId, {
        attributes: { exclude: ["password", "session", "tokenExpiration"] }
      });
      if (!user) throw new Error("User not found");
      logToFile(`Fetched user profile: ${searchId}`);
      return user;
    }
  }
};

const Mutation = {
  ratePost: {
    type: GraphQLInt,
    args: {
      postId: { type: new GraphQLNonNull(GraphQLID) },
      rating: { type: new GraphQLNonNull(GraphQLInt) }
    },
    resolve: async (_, { postId, rating }, context) => {
      const decoded = ensureAuth(context);
      const userId = decoded.id;
      if (rating < 1 || rating > 5) {
        logToFile(`Invalid rating ${rating} by user ${userId}`);
        throw new Error("Rating must be between 1 and 5");
      }
      const [record, created] = await Rating.findOrCreate({
        where: { userId, postId },
        defaults: { rating }
      });
      if (!created) {
        record.rating = rating;
        await record.save();
      }
      logToFile(`Post ${postId} rated ${rating} by user ${userId}`);
      return record.rating;
    }
  },

  toggleLike: {
    type: GraphQLBoolean,
    args: {
      postId: { type: new GraphQLNonNull(GraphQLID) }
    },
    resolve: async (_, { postId }, context) => {
      const decoded = ensureAuth(context);
      const userId = decoded.id;
      const existing = await Like.findOne({ where: { userId, postId } });
      if (existing) {
        await existing.destroy();
        logToFile(`User ${userId} unliked post ${postId}`);
        return false;
      }
      await Like.create({ userId, postId });
      logToFile(`User ${userId} liked post ${postId}`);
      return true;
    }
  },

  addComment: {
    type: CommentType,
    args: {
      input: { type: new GraphQLNonNull(CommentInputType) }
    },
    resolve: async (_, { input }, context) => {
      const decoded = ensureAuth(context);
      const comment = await Comment.create({ ...input, userId: decoded.id });
      logToFile(`User ${decoded.id} commented on post ${input.postId}`);
      return comment;
    }
  },

  deleteComment: {
    type: GraphQLBoolean,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) }
    },
    resolve: async (_, { id }, context) => {
      const decoded = ensureAuth(context);
      const comment = await Comment.findByPk(id);
      if (!comment) throw new Error("Comment not found");
      if (decoded.role !== "admin" && decoded.id !== comment.userId) {
        throw new Error("Access denied");
      }
      await comment.destroy();
      logToFile(`User ${decoded.id} deleted comment ${id}`);
      return true;
    }
  },

  createPost: {
    type: PostType,
    args: {
      input: { type: PostInputType }
    },
    resolve: async (_, { input }, context) => {
      const decoded = ensureAuth(context);
      const post = await Post.create({
        userId: decoded.id,
        caption: input.caption,
        mediaUrl: input.mediaUrl || []
      });
      logToFile(`Post created by user ${decoded.id}`);
      return post;
    }
  },

  updatePost: {
    type: PostType,
    args: {
      id: { type: GraphQLID },
      input: { type: PostInputType }
    },
    resolve: async (_, { id, input }, context) => {
      const decoded = ensureAuth(context);
      const post = await Post.findByPk(id);
      if (!post) throw new Error("Post not found");
      if (decoded.role !== "admin" && post.userId !== decoded.id) {
        throw new Error("Access denied.");
      }
      await post.update(input);
      logToFile(`Post ${id} updated by user ${decoded.id}`);
      return post;
    }
  },

  deletePost: {
    type: GraphQLBoolean,
    args: { id: { type: GraphQLID } },
    resolve: async (_, { id }, context) => {
      const decoded = ensureAuth(context);
      const post = await Post.findByPk(id);
      if (!post) throw new Error("Post not found");
      if (decoded.role !== "admin" && post.userId !== decoded.id) {
        throw new Error("Access denied.");
      }
      await Comment.destroy({ where: { postId: id } });
      await Like.destroy({ where: { postId: id } });
      await Rating.destroy({ where: { postId: id } });
      await post.destroy();
      logToFile(`Post ${id} deleted by user ${decoded.id}`);
      return true;
    }
  },

  signup: {
    type: AuthPayloadType,
    args: {
      input: { type: new GraphQLNonNull(UserInputType) }
    },
    resolve: async (_, { input }) => {
      const { username, email, password, bio } = input;
      const exists = await User.findOne({ where: { email } });
      if (exists) throw new Error("Email already in use");

      const user = await User.create({ username, email, password: password, bio });
      logToFile(`User signed up: ${email}`);
      return {
        message: "User created",
        userId: user.id,
        role: user.role
      };
    }
  },

  login: {
    type: AuthPayloadType,
    args: {
      email:    { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: async (_, { email, password }) => {
      console.log("LOGIN ATTEMPT:", { email, password });           // debug
  
      const user = await User.findOne({ where: { email } });
      console.log("FOUND USER:", user && { id: user.id, pwd: user.password });  // debug
  
      if (!user) {
        console.log("→ No user record");                            // debug
        throw new Error("Invalid credentials");
      }
  
      const ok = await bcrypt.compare(password, user.password);
      console.log("PASSWORD MATCH?", ok);                           // debug
  
      if (!ok) {
        console.log("→ Password mismatch");                         // debug
        throw new Error("Invalid credentials");
      }
  
      // everything OK…
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h"
      });
      user.session = token;
      user.tokenExpiration = new Date(Date.now() + 3600_000);
      await user.save();
      console.log("→ Login SUCCESS:", user.id);                     // debug
  
      return {
        token,
        userId: user.id,
        role: user.role,
        message: "Login successful"
      };
    }
  }
  ,

  updateUser: {
    type: UserType,
    args: {
      data: { type: new GraphQLNonNull(UserInputType) }
    },
    resolve: async (_, { data }, context) => {
      const decoded = ensureAuth(context);
      const updates = { ...data };
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      const [updated] = await User.update(updates, {
        where: { id: decoded.id }
      });
      if (!updated) throw new Error("Update failed");
      logToFile(`User updated: ${decoded.id}`);
      return await User.findByPk(decoded.id, {
        attributes: { exclude: ["password", "session", "tokenExpiration"] }
      });
    }
  },

  deleteUser: {
    type: GraphQLBoolean,
    args: {
      id: { type: GraphQLID }
    },
    resolve: async (_, { id }, context) => {
      const decoded = ensureAuth(context);
      const target = decoded.role === "admin" && id ? id : decoded.id;
      const deleted = await User.destroy({ where: { id: target } });
      if (!deleted) throw new Error("Delete failed");
      logToFile(`User deleted: ${target}`);
      return true;
    }
  }
};

module.exports = { RootQuery, Mutation };
