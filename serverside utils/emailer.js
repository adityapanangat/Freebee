//**make email into transactions somehow

import nodemailer from "nodemailer";
import dotenv from "dotenv"; // for environemntal vars
import { serversideIssue } from "../server.js";
dotenv.config();

var transporter;

export function setUpEmailer() {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
            },
            from: process.env.EMAIL_USER,
        });
        return true;
    }
    catch(err) {
        console.log(err);
        serversideIssue("In setUpEmailer()");
        return false;
    }
}

/*
    sending emails when:
        - someone accepts a donation
        - someone donates a donation
        - contact your accepter
        - a donation is unlisted
        - a donation is unaccepted
*/


//make it so that productName link takes you to donation

//sent to accepter and donor when an accepter accepts a donation
export async function donationAcceptedEmail(productID, productName, productImage, donorEmail, accepterEmail) { 
    //need to send email to accepter and donor
    //html to send to accepter:
    const accepterHTML = `
    <!DOCTYPE html>
    <html>
    <body>
        <p style="font-size: 17px; color:#ea9d3e;">
            Hi ${accepterEmail.split('@')[0]},
        </p>
        <p style="font-size: 15px;">
            Congratulations on accepting a donation!
        </p>
        <p> You have successfully accepted the following donation: </p>
        <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
        <img src=data:image/jpeg;base64,${productImage.toString('base64')}'> 
        <p> Your donor has been given your email. They have been instructed to reach out to you. </p>
        <p> Your donor only receives benefits when you confirm that you have received this product. Once you have received it, confirm it </p> <a href=${process.env.DOMAIN_NAME}/transactionDetails/accepter?p=${productID}> here. </a> <p> If you do not confirm that you have received this product after receiving it, you may be reported, and your account may be banned. </p>
        
        <br>
        <p> Thanks, </p>
        <p>The Freebee Project's Team</p>
        
    </body>
    </html>
    `;

    //html to send to donor:
    const donorHTML = `
    <!DOCTYPE html>
    <html>
    <body>
        <p style="font-size: 17px; color:#ea9d3e;">
            Hi ${donorEmail.split('@')[0]},
        </p>
        <p style="font-size: 15px;">
            The following donation has been accepted by ${accepterEmail}:
        </p>
        <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
        <img src='data:image/jpeg;base64,${productImage.toString('base64')}'> 
        <p> Please start a conversation with your accepter and discuss options to deliver the donation. You can contact by emailing: ${accepterEmail}</p>
        <p> You will only be rewarded for your donation after your accepter confirms that they have received it. If they fail to confirm that they received your donation, please report them </p> <a href=${process.env.DOMAIN_NAME}/transactionDetails/donor?p=${productID}> here. </a> 
        <br>
        <p> Thanks, </p>
        <p>The Freebee Project's Team</p>
        
    </body>
    </html>
    `;

    //send email
    //to donor:
    try {
        await sendEmail(donorEmail, "Your donation has been accepted", donorHTML);

        //to accepter:
        await sendEmail(accepterEmail, "You have accepted a donation - Wait for your donor to contact you", accepterHTML);
    }
    catch(err) {
        throw new Error("Couldn't send emails");
    }
}

//sent to donor when donor makes a donation
export async function donationMadeEmail (productID, productName, productImage, donorEmail) { 
    //need to send email to just donor
    const donorHTML = `
    <!DOCTYPE html>
    <html>
    <body>
        <p style="font-size: 17px; color:#ea9d3e;">
            Hi ${donorEmail.split('@')[0]},
        </p>
        <p style="font-size: 15px;">
            Thank you for making a donation!
        </p>
        <p> You have successfully accepted the following donation: </p>
        <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
        <img src='data:image/jpeg;base64,${productImage.toString('base64')}'> 
        <p> You will be rewarded for this donation once it is accepted and given to someone. You will receive further instructions about this later.</p>
        <p> It is do-gooders like you who keep our website running. We can not express how much we value you. </p>
        
        <br>
        <p> Thanks, </p>
        <p>The Freebee Project's Team</p>
        
    </body>
    </html>
    `;

    //send email
    //to donor:
    await sendEmail(donorEmail, `Your donation has been listed | ${productName}`, donorHTML);
}

//sent to donor when accepter accepts a donation
export async function contactAccepterEmail (productID, productName, productImage, donorEmail, accepterEmail) { 
    console.log(productImage);
    console.log(productImage[0]);
    console.log(productImage.data);
    console.log(productImage[0].data);
    //html to send to donor:
    const donorHTML = `
    <!DOCTYPE html>
    <html>
    <body>
        <p style="font-size: 17px; color:#ea9d3e;">
            Hi ${donorEmail.split('@')[0]},
        </p>
        <p style="font-size: 15px;">
            The following donation has been accepted by ${accepterEmail}:
        </p>
        <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
        <img src='data:image/jpeg;base64,${productImage}'>
        <p> Please start a conversation with your accepter and discuss options to deliver the donation. You will be rewarded once they confirm that they have received it.</p>
        <a href="mailto:${accepterEmail}?subject=Freebee - This is your donor | ${productName}">Email your accepter</a>
        <br>
        <p> Thanks, </p>
        <p>The Freebee Project's Team</p>
        
    </body>
    </html>
    `;

    await sendEmail(donorEmail, `Contact Your Accepter | ${productName}`, donorHTML);


}

//sent to accepter and donor when a donor unlists an item
export async function donationUnlistedWithAccepterEmail(productID, productName, productImage, donorEmail, accepterEmail) {
//need to send email to accepter and donor
    //html to send to accepter:
    const accepterHTML = `
    <!DOCTYPE html>
    <html>
    <body>
        <p style="font-size: 17px; color:#ea9d3e;">
            Hi ${accepterEmail.split('@')[0]},
        </p>
        <p style="font-size: 15px;">
            Unfortunately, your donor has decided to unlist an item that you have already accepted. The following item:
        </p>
        <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
        <img src='data:image/jpeg;base64,${productImage.toString('base64')}'> 
        <p> You will no longer be able to accept this donation. Don't worry, though. There's always more donations to find at  </p> <a href=${process.env.DOMAIN_NAME}> Freebee.com! </a>
        
        <br>
        <p> Thank you, </p>
        <p>The Freebee Project's Team</p>
        
    </body>
    </html>
    `;

    //html to send to donor:
    const donorHTML = `
    <!DOCTYPE html>
    <html>
    <body>
        <p style="font-size: 17px; color:#ea9d3e;">
            Hi ${donorEmail.split('@')[0]},
        </p>
        <p style="font-size: 15px;">
            The following donation has been successfuly unlisted from our website:
        </p>
        <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
        <img src='data:image/jpeg;base64,${productImage.toString('base64')}'> 
        <p> In the future, please refrain from unlisting donations after someone has already accepted them. We're sure they were disappointed. </p>
        <br>
        <p> Thanks, </p>
        <p>The Freebee Project's Team</p>
        
    </body>
    </html>
    `;

    //send email
    //to donor:
    await sendEmail(donorEmail, "Your Donation Has Been Unlisted", donorHTML);

    //to accepter:
    await sendEmail(accepterEmail, "An Item You Accepted Has Been Unlisted", accepterHTML);
}

//to send to donor when they unlist a donation without an accepter
export async function donationUnlistedWithoutAccepterEmail(productID, productName, productImage, donorEmail, accepterEmail) {
        //html to send to donor:
        const donorHTML = `
        <!DOCTYPE html>
        <html>
        <body>
            <p style="font-size: 17px; color:#ea9d3e;">
                Hi ${donorEmail.split('@')[0]},
            </p>
            <p style="font-size: 15px;">
                The following donation has been successfuly unlisted from our website:
            </p>
            <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
            <img src='data:image/jpeg;base64,${productImage.toString('base64')}'> 
            <br>
            <p> Thanks, </p>
            <p>The Freebee Project's Team</p>
            
        </body>
        </html>
        `;
    
        //send email
        //to donor:
        await sendEmail(donorEmail, "Your Donation Has Been Unlisted", donorHTML);
}

//sent to accepter and donor when a accepter unaccepts an item
export async function donationUnacceptedEmail(productID, productName, productImage, donorEmail, accepterEmail) {
    //need to send email to accepter and donor
        //html to send to accepter:
        const accepterHTML = `
        <!DOCTYPE html>
        <html>
        <body>
            <p style="font-size: 17px; color:#ea9d3e;">
                Hi ${accepterEmail.split('@')[0]},
            </p>
            <p style="font-size: 15px;">
                You have successfully unaccepted the following item:
            </p>
            <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
            <img src='data:image/jpeg;base64,${productImage.toString('base64')}'> 
            
            <br>
            <p> Thank you, </p>
            <p>The Freebee Project's Team</p>
            
        </body>
        </html>
        `;
    
        //html to send to donor:
        const donorHTML = `
        <!DOCTYPE html>
        <html>
        <body>
            <p style="font-size: 17px; color:#ea9d3e;">
                Hi ${donorEmail.split('@')[0]},
            </p>
            <p style="font-size: 15px;">
               Unfortunately, your accepter has decided that they no longer want the following item:
            </p>
            <a href='${process.env.DOMAIN_NAME}/freebie?p=${productID}'>${productName}</a>
            <img src='data:image/jpeg;base64,${productImage.toString('base64')}'> 
            <p> Your donation has been relisted on the website automatically so that someone else can benefit from your generousness. Thank you for your patience. </p>
            <br>
            <p> Regards, </p>
            <p>The Freebee Project's Team</p>
            
        </body>
        </html>
        `;
    
        //send email
        //to donor:
        await sendEmail(donorEmail, "Your Donation Has Been Unlisted", donorHTML);
    
        //to accepter:
        await sendEmail(accepterEmail, "An Item You Accepted Has Been Unlisted", accepterHTML);

}


export async function sendVerificationEmail(recip, verificationID) {
    const htmlToSend = `
        <!DOCTYPE html>
        <html>
        <body>
            <p style="font-size: 17px; color:#ea9d3e;">
                Hi ${recip.split('@')[0]},
            </p>
            <p style="font-size: 15px;">
                Thank you for joining Freebee, our favorite community of do-gooders! We can't express in words how thankful we are to have one more person join the team. Please click the link below to verify your email.
            </p>
            <a style="font-size:15px;" href="${process.env.DOMAIN_NAME}/emailVerification/ve!${verificationID}">
                Verify email
            </a>
            <p></p>
            
        </body>
        </html>
    `;

    try {
        await sendEmail(recip, "Verify Your Email", htmlToSend);
        return true;
    }
    catch(error) {
        console.log(error); 
        serversideIssue("In setUpEmailer()");
        return false;
    }
}

//needs to always be used with try catch
async function sendEmail(recipient, subject, htmlCode) {

    const mailOptions = {
        from: "Freebee <thefreebeeproject@gmail.com>",
        to: recipient,
        subject: subject,
        html: htmlCode
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error){
            if (error) { reject(error); } 
            else { resolve(); }
        });
    });
}