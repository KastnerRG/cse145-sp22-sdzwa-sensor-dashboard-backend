const {PrismaClient} = require('@prisma/client');
const {user} = new PrismaClient();
const crypto = require('crypto');

// Create new user
const newUser = async (req, res) => {
    // Get user inputs
    const { first_name, last_name, email, password } = req.body;
    // Validate user inputs - potential for security sanitization...
    if (!(email && password && first_name && last_name)) {
        res.status(400).send(`All input is required ${email} ${password} ${first_name} ${last_name}`);
    }

    const userExists = await user.findUnique(
        { where: { email: email },
        select: { email: true} }
    );


    if(userExists) {
        return res.status(409).send("User Already Exists.");
    }

    salt = crypto.randomBytes(16).toString('hex');
    encryptedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

    const newUser = await user.create({
        data: {
            firstName: first_name,
            lastName: last_name,
            email: email,
            password: encryptedPassword,
            salt: salt,
        }
    });

    const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
    );

    newUser.token = token;

    res.status(201).json(newUser);
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        res.status(400).send("All input is required");
    }
    

    const userExists = await user.findUnique({
        where: {
            email: req.body.email
        },
        select: {
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            salt: true
        }
    });

    if (userExists && this.hash === userExists.password) {
        const token = jwt.sign(
            { user_id: user._id, email } ,
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
    }
    res.status(200).json(userExists);
};

/* Below are generic API templates for different CRUD (CREATE READ UPDATE DELETE) operations on the database */

//Template for reading all admin users in the database
const getUsers = async (req, res) => {
    const users = await user.findMany({
        select: {
            user_id: true,
            firstName: true,
            lastName: true
        },
        where: {

        }
    });

    res.json(users);
};

//Template for finding users by their admin ID
const getUserById = async (req, res) => {
    const users = await user.findUnique({
        select: {
            user_id: true,
            firstName: true,
            lastName: true,
            email: true
        },
        where: {
            user_id: parseInt(req.params.id)
        }
    });
    if (!users) {
        return res.status(400).json({
            msg: 'User NOT found'
        });
    }


    res.json(users);
};

//Template for finding users by their lastname
const getUserByName = async (req, res) => {
    const users = await user.findMany({
        select: {
            user_id: true,
            email: true
        },
        where: {
            lastName: req.params.lastName

        }
    });

    if (!users) {
        return res.status(400).json({
            msg: 'User NOT found'
        });
    }

    res.json(users);
};

//Template for updating user name and ID by their email
const updateUserByEmail = async (req, res) => {


    if (req.body.email) {
        const userExists = await user.findUnique({
            where: {
                email: req.body.email
            },
            select: {
                email: true
            }
        });

        if(userExists) {
            return res.status(400).json({
                msg: 'User with email = ' + req.body.email + ' already exists, choose another email'
            });
        }
    }

    const users = await user.update({
        where: {
            email: parseInt(req.params.email)
        },
        data: {
            user_id: req.body.user_id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        }
    });

    if (!users) {
        return res.status(400).json({
            msg: 'USER NOT found'
        });
    }
    res.json(users);
};

//Template for deleting admin users from the database by their email 
const deleteUserByEmail = async (req, res) => {
    const userExists = await user.findUnique({
        where: {
            email: req.params.email
        },
        select: {
            email: true
        }
    });

    if(!userExists) {
        return res.status(400).json({
            msg: 'USER NOT found'
        });
    }

    const users = await user.delete({
        where: {
            email: req.params.email
        }
    });

    res.json(users);
};

//Template for finding user name and ID from email
const getUserByEmail = async (req, res) => {
    const users = await user.findUnique({
        select: {
            user_id: true,
            firstName: true,
            lastName: true,
            email: true
        },
        where: {
            email: req.params.email
        }
    });
    if (!users) {
        return res.status(400).json({
            msg: 'User NOT found'
        });
    }


    res.json(users);
};

/* To check valid password
UserSchema.methods.validPassword = function(password) {

  var hash = crypto.pbkdf2Sync(password,
  this.salt, 1000, 64, `sha512`).toString(`hex`);
  return this.hash === hash;
};

https://www.loginradius.com/blog/engineering/password-hashing-with-nodejs/
*/

module.exports = {newUser, loginUser, getUsers, getUserById, getUserByEmail, getUserByName, updateUserByEmail, deleteUserByEmail};