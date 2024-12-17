import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { addFreebeeAccount, queryDatabase } from "../database.js"; 
   
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
        },
        async function (acessToken, refreshToken, profile, done) {
            try {
                // Check if the user already exists in  database
                const query = `SELECT * from users WHERE email = ?`;
                const [foundUser] = await queryDatabase(query, [profile.emails[0].value]);

                console.log(foundUser);

                if (foundUser) {
                    // User exists, pass user to serialize function
                    console.log("User found: ", foundUser);
                    return done(null, foundUser);
                } else {
                    // User doesn't exist, create  new user
                    await addFreebeeAccount(profile.emails[0].value, null, null);

                    // Retrieve the new user from the database to get the user object
                    const [insertedUser] = await queryDatabase(query, [profile.emails[0].value]);
                    console.log(insertedUser);

                    console.log("New user created: ", insertedUser);
                    return done(null, insertedUser);
                }

            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser(function (user, done) {
    done(null, user.id); // This will be passed into the callback for deserializeUser
});

passport.deserializeUser(async function (id, done) {
    try {
        console.log("Deserializing user with ID:", id);
        const query = `SELECT * from users WHERE id = ?`;
        const [foundUser] = await queryDatabase(query, [id]);
        if (!foundUser) throw new Error("User not found");

        done(null, foundUser);
    } catch (err) {
        done(err, null);
    }
});