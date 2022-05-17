const Magic = require("../model/userMagic");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const jwt_secret = "this is my jwt token gjh";
const { v4: uuidv4 } = require('uuid');
const {send_magic_link} = require('./emailmagic')

const register = async (email) => {
	try {
		const newUser = {
			Email:email,
			MagicLink: uuidv4()
			
		};
		let user = await Magic.create(newUser);
		// send magic link to email
		let sendEmail = send_magic_link(email,user.MagicLink,'signup')
		return({ ok: true, message: "User created"});
} catch (error) {
	return({ ok: false, error });
}
};

exports.login = async (req, res) => {
	const { email, magicLink } = req.body;
	if (!email)
		return res.json({ ok: false, message: "All field are required" });
	if (!validator.isEmail(email))
		return res.json({ ok: false, message: "invalid email provided" });

	try {
		const user = await Magic.findOne({ Email:email });
		if(!user){
			let reg = await register(email)
			res.send({ok:true,message:'Your account has been created, click the link in email to sign in 👻'})
		}else if(!magicLink){
			try{
				const user = await Magic.findOneAndUpdate(
					{Email:email}, 
					{MagicLink: uuidv4(), MagicLinkExpired: false}, 
					{returnDocument:'after'}
					);
    		// send email with magic link
    		send_magic_link(email,user.MagicLink)
    		res.send({ok:true,message:'Hit the link in email to sign in'})
    	}catch{

    	}
    }else if(user.MagicLink == magicLink && !user.MagicLinkExpired) {
      const token = jwt.sign(user.toJSON(), jwt_secret, { expiresIn: "1h" }); //{expiresIn:'365d'}
      await Magic.findOneAndUpdate(
      	{Email:email}, 
      	{MagicLinkExpired: true}
      	)
      res.json({ ok: true, message: "Welcome back", token, email });
    }else return res.json({ ok: false, message: "Magic link expired or incorrect " });
  } catch (error) {
  	res.json({ ok: false, error });
  }
};

exports.verify_token = (req, res) => {
	console.log(req.headers.authorization);
	const token = req.headers.authorization;
	jwt.verify(token, jwt_secret, (err, succ) => {
		err
		? res.json({ ok: false, message: "something went wrong" })
		: res.json({ ok: true, succ });
	});
};

//module.exports = { login, verify_token }