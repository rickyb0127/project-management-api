const jwt = require('jsonwebtoken');
import express from 'express';
const Users = require('../models/Users');

export const getTokenForRequest = (req: express.Request) => {
  let token = req.headers['authorization'] || "";
  if(token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  return token;
};

export const decodeToken = async(token: string) => {
  console.log("decoding token");
  const secret = process.env.JWT_SECRET;
  let result;

  jwt.verify(token, secret, async (err: any, decoded: any) => {
    if(!err) {
      result = decoded;
    }
  });

  return result;
};

export const getUserByEmail = async(email: string) => {
  console.log("fetching user by email");

  try {
    const user = Users.findOne({
      email 
    });

    return user;
  } catch(err) {
    console.log("user not found");
    return null;
  }
};