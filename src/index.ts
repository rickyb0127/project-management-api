import { decodeToken, getTokenForRequest, getUserByEmail } from "./helpers/auth";
const Users = require('./models/Users');
const UserStories = require('./models/UserStories');
const Projects = require('./models/Projects');
const express = require('express');
import type { NextFunction, Request, Response } from 'express';
import { createUserByEmail } from "./helpers/create";
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const initDb = require("./db");

initDb();
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`server started on port ${port}`));

app.get("/api/v1/user", async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getTokenForRequest(req); 
    const decoded = await decodeToken(token);

    if(decoded) {
      try {
        const user = await getUserByEmail(decoded['email']);
        const authedUser = {
          ...user,
          settings: JSON.parse(JSON.stringify(user!.settings))
        };

        res.status(200).send({
          user: {
            firstName: authedUser.firstName,
            lastName: authedUser.lastName,
            email: authedUser.email,
            settings: authedUser.settings
          }
        });
      } catch(err) {
        throw new Error("User not found");
      }
    } else {
      throw new Error("Token not valid");
    }
  } catch(err) {
    next(err);
  }
});

app.get("/api/v1/projects", async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getTokenForRequest(req); 
    const decoded = await decodeToken(token);

    if(decoded) {
      try {
        const user = await getUserByEmail(decoded['email']);
        const userId = user._id.toString();
        const userProjects = await Projects.find({
          teamMembers: { $in: [user] }
        });

        res.status(200).send({
          userProjects
        });
      } catch(err) {
        throw new Error("User not found");
      }
    } else {
      throw new Error("Token not valid");
    }
  } catch(err) {
    next(err);
  }
});

app.post("/api/v1/login", async(req: Request, res: Response, next: NextFunction) => {
  const {
    email,
    password
  } = req.body;

  try {
    const user = await getUserByEmail(email);
    console.log(user)

    if(user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.JWT_SECRET,
        // { expiresIn: "5h" }
      );

      res.status(200).send({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          settings: user.settings,
          token
        }
      });
    } else {
      throw new Error("Incorrect email or password");
    }
  } catch(err) {
    next(err);
  }
});

app.post("/api/v1/register", async(req: Request, res: Response, next: NextFunction) => {
  const {
    firstName,
    lastName,
    email,
    password
  } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if(existingUser) {
      throw new Error("User already exists. Please login");
    } else {
      try {  
        const encryptedPassword = await bcrypt.hash(password, 10);
  
        const user = await Users.create({
          firstName,
          lastName,
          email: email.toLowerCase(),
          password: encryptedPassword,
          imgUrl: null,
          settings: []
        });
  
        const token = jwt.sign(
          { user_id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "5h" }
        );
  
        res.status(200).send({
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            settings: user.settings,
            token
          }
        });
      } catch(err) {
        throw new Error('Could not create accout. Please try again');
      }
    }
  } catch(err) {
    next(err);
  }
});

app.post("/api/v1/project/new", async(req: Request, res: Response, next: NextFunction) => {
  const {
    title,
    description
  } = req.body;

  try {
    const token = getTokenForRequest(req); 
    const decoded = await decodeToken(token);

    if(decoded) {
      try {
        const user = await getUserByEmail(decoded['email']);
        const project = await Projects.create({
          title,
          description,
          ownerId: user._id,
          teamMembers: [user]
        });

        res.status(200).send({
          project
        });
      } catch(err) {
        throw new Error("User not found");
      }
    } else {
      // TODO refresh user token
      throw new Error("Token not valid");
    }
  } catch(err) {
    next(err);
  }
});

app.put("/api/v1/project/:projectId", async(req: Request, res: Response, next: NextFunction) => {
  const {
    updatedTitle,
    updatedImgUrl,
    updatedDescription,
    teamMemberEmailToAdd,
    updatedOwnerId
  } = req.body;
  const projectId = req.params.projectId;
  console.log(projectId)
  console.log(teamMemberEmailToAdd)

  try {
    const token = getTokenForRequest(req); 
    const decoded = await decodeToken(token);

    if(decoded) {
      try {
        await getUserByEmail(decoded['email']);
        const project = await Projects.findById(projectId);

        // TODO add email service instead of automatically creating user
        const teamMemberToBeAdded = await createUserByEmail(teamMemberEmailToAdd);
        // const newTeamMemberId = teamMemberToBeAdded._id.toString();
        const updateParams = {
          title: updatedTitle || project.title,
          imgUrl: updatedImgUrl || project.imgUrl,
          description: updatedDescription || project.description,
          ownerId: updatedOwnerId || project.ownerId,
          $addToSet: { teamMembers: teamMemberToBeAdded }
        }

        const updatedProject = await Projects.findByIdAndUpdate({ _id: projectId }, updateParams, {new: true});

        res.status(200).send({
          project: updatedProject
        });
      } catch(err) {
        throw new Error("User not found");
      }
    } else {
      // TODO refresh user token
      throw new Error("Token not valid");
    }
  } catch(err) {
    next(err);
  }
});

app.get("/api/v1/user-stories/:projectId", async(req: Request, res: Response, next: NextFunction) => {
  const projectId = req.params.projectId;
  // const {
  //   projectId,
  //   title,
  //   description,
  //   assigned,
  //   status,
  //   numPoints
  // } = req.body;

  try {
    const token = getTokenForRequest(req); 
    const decoded = await decodeToken(token);

    if(decoded) {
      try {
        await getUserByEmail(decoded['email']);
        const userStories = await UserStories.find({
          projectId
        });

        res.status(200).send({
          userStories
        });
      } catch(err) {
        throw new Error("User stories for project not found");
      }
    } else {
      // TODO refresh user token
      throw new Error("Token not valid");
    }
  } catch(err) {
    next(err);
  }
});

app.post("/api/v1/user-stories/new", async(req: Request, res: Response, next: NextFunction) => {
  const {
    projectId,
    title,
    description,
    assigned,
    status,
    numPoints
  } = req.body;

  try {
    const token = getTokenForRequest(req); 
    const decoded = await decodeToken(token);

    if(decoded) {
      try {
        const user = await getUserByEmail(decoded['email']);
        const userStory = await UserStories.create({
          projectId,
          title,
          description,
          assigned: [assigned],
          status,
          numPoints,
          authorId: user._id
        });

        res.status(200).send({
          userStory
        });
      } catch(err) {
        throw new Error("User story could not be created");
      }
    } else {
      // TODO refresh user token
      throw new Error("Token not valid");
    }
  } catch(err) {
    next(err);
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // global error handling
  // TODO right now we send a 400 for every error
  if(err) {
    console.log("global error handling");
    res.status(400).send({
      error: err.message
    });
  }
});