const { User } = require('../models');

const Mail = require('../services/MailService');

class SessionController {
  /**
   * take the data from body
   * find the user based in the email from req.body
   * check if the email exists in the db
   * check if the password matches with that users pw from the db
   * then return ok
   */
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // checkPassword is a method inside User, if it does not match then break early
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Incorrect Password!' });
    }

    await Mail.send({
      from: 'Dude',
      to: `${user.name} ${user.email}`,
      subject: 'New access',
      text: 'New access to your account.',
    });

    return res.json({
      token: await user.generateToken(),
    });
  }
}

module.exports = new SessionController();
