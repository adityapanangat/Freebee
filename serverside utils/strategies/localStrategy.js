import passport from "passport";
import { Strategy } from "passport-local";
import { queryDatabase } from "../database.js";


export default passport.use(
    new Strategy({usernameField: 'email'}, async function(email, password, done) {
        //this function is called after auth -- we need to validate the user
        try {
            email = email.toLowerCase();
            //finding password for given email
            const query = `SELECT * from users WHERE email = ?`
            const [foundUser] = await queryDatabase(query, [email]);   
              
            //if user doesn't exist or passwords don't match, throw error
            if(foundUser == undefined || foundUser == "" || foundUser.password !== password) {
                if(foundUser && foundUser.email && foundUser.password == null) {
                    return done(null, false, { message: 'This user has signed in using Gmail' });
                }   
                else {
                    return done(null, false, { message: 'User not found with these credentials' });
                }
            }

            //validation passed -- go to next and pass in user object
            console.log("Validation passed for user: ", foundUser);
            done(null, foundUser); //passes the user on to be serialized into the session
        }
        catch(err) {
            done(err);
        }
    })
)

//this function takes the user object that was validated and stores it in the session
passport.serializeUser(function(user, done) {
    console.log("Serializing");
    done(null, user.id); //this will be passed into callback for deserialize user
});

passport.deserializeUser(async function(id, done) {
    try {
        console.log("Deserializing");
        const query = `SELECT * from users WHERE id = ?`
        const [foundUser] = await queryDatabase(query, [id]);
        if(!foundUser) throw new Error();

        done(null, foundUser);
    }
    catch(err) {
        done(err, null);
    }
});

