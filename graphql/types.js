// graphql/types.js
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInputObjectType
  , GraphQLFloat
  } = require("graphql");
  
  const { User } = require("../models");
  const { Post } = require("../models");

  
  const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
      id:          { type: GraphQLID },
      username:    { type: GraphQLString },
      email:       { type: GraphQLString },
      bio:         { type: GraphQLString },
      profilePicture: { type: GraphQLString },
      role:        { type: GraphQLString }
    })
  });
  
  // Returned by login/signup mutations
  const AuthPayloadType = new GraphQLObjectType({
    name: "AuthPayload",
    fields: () => ({
      token:   { type: GraphQLString },
      userId:  { type: GraphQLID },
      role:    { type: GraphQLString },
      message: { type: GraphQLString }
    })
  });
  
  // Input type for signup/update
  const UserInputType = new GraphQLInputObjectType({
    name: "UserInput",
    fields: {
      username:          { type: new GraphQLNonNull(GraphQLString) },
      email:             { type: new GraphQLNonNull(GraphQLString) },
      password:          { type: GraphQLString },  // optional on update
      bio:               { type: GraphQLString }
    }
  });
  

  const PostType = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
      id:        { type: GraphQLID },
      caption:   { type: GraphQLString },
      mediaUrl:  { type: GraphQLList(GraphQLString) },
      userId:    { type: GraphQLID }
    })
  });
  
  // Input for creating/updating a post
  const PostInputType = new GraphQLInputObjectType({
    name: "PostInput",
    fields: () => ({
      caption:   { type: GraphQLString },
      mediaUrl:  { type: GraphQLList(GraphQLString) }
    })
  });


  const CommentType = new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
      id:              { type: GraphQLID },
      content:         { type: GraphQLString },
      postId:          { type: GraphQLID },
      userId:          { type: GraphQLID },
      parentCommentId: { type: GraphQLID },
      createdAt:       { type: GraphQLString },
      replies:         { type: new GraphQLList(CommentType) } // recursive nesting
    })
  });
  
  const CommentInputType = new GraphQLInputObjectType({
    name: "CommentInput",
    fields: {
      content:         { type: new GraphQLNonNull(GraphQLString) },
      postId:          { type: new GraphQLNonNull(GraphQLID) },
      parentCommentId: { type: GraphQLID }
    }
  });
  
  
  const LikeType = new GraphQLObjectType({
    name: "Like",
    fields: () => ({
      userId: { type: GraphQLID },
      postId: { type: GraphQLID }
    })
  });

  const RatingType = new GraphQLObjectType({
    name: "Rating",
    fields: () => ({
      userId:  { type: GraphQLID },
      postId:  { type: GraphQLID },
      rating:  { type: GraphQLInt }
    })
  })
  
  module.exports = {
    UserType,
    AuthPayloadType,
    UserInputType,
    PostType,
    PostInputType,
    CommentType,
    CommentInputType,
    LikeType,
    RatingType
  };
  