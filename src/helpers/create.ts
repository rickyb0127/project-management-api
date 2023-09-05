const jwt = require('jsonwebtoken');
import express from 'express';
const bcrypt = require('bcryptjs');
import { getUserByEmail } from './auth';
const Users = require('../models/Users');

export const createUserByEmail = async(email: string) => {
  console.log("creating user by email");

  try {
    const existingUser = await getUserByEmail(email);
    if(existingUser) {
      return existingUser;
    }

    const encryptedPassword = await bcrypt.hash('temp', 10);

    const newUser = Users.create({
      email,
      password: encryptedPassword,
      firstName: "New",
      lastName: "User"
    });

    return newUser;
  } catch(err) {
    console.log(err)
    return err;
  }
};