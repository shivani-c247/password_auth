const Magic = require("../model/userMagic");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const { v4: uuidv4 } = require("uuid");
const { sendMagicLink } = require("./emailMagicLink");

const register = async (email) => {
  try {
    const newUser = {
      email: email,
      magic_link: uuidv4(),
    };
    let user = await Magic.create(newUser);
    // send magic link to email
    let sendEmail = sendMagicLink(email, user.magic_link, "signup");
    return { ok: true, message: "User created" };
  } catch (error) {
    return { ok: false, error };
  }
};

exports.login = async (req, res) => {
  const { email, magicLink } = req.body;
  try {
    const user = await Magic.findOne({ email: email });
    if (!user) {
      let reg = await register(email);
      res.send({
        ok: true,
        message:
          "Your account has been created, click the link in email to sign in",
      });
    } else if (!magicLink) {
      try {
        const user = await Magic.findOneAndUpdate(
          { email: email },
          { magic_link: uuidv4(), magicLinkExpired: false }
        );
        // send email with magic link
        sendMagicLink(email, user.magic_link);
        res.send({ ok: true, message: "Hit the link in email to sign in" });
      } catch (e) {
        console.log(e);
        res.json({ ok: false, e });
      }
    } else if (user.magic_link == magicLink && !user.magicLinkExpired) {
      const token = jwt.sign(user.toJSON(), jwt_secret, { expiresIn: "1h" });
      await Magic.findOneAndUpdate(
        { email: email },
        { magicLinkExpired: true }
      );
      res.json({ ok: true, message: "Welcome back", token, email });
    } else
      return res.json({
        ok: false,
        message: "Magic link expired or incorrect ",
      });
  } catch (error) {
    res.json({ ok: false, error });
  }
};
