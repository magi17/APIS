const nodemailer = require('nodemailer');

module.exports = {
    name: "email",
    category: "communication",
    usage: "/email?recipient=<email>&text=<message>",
    handler: async (req, res) => {
        const { recipient, text } = req.query;

        if (!recipient || !text) {
            return res.status(400).json({ error: 'Recipient email and text are required.' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tutelpagebot@gmail.com',
                pass: 'hxhsbvdagwdbcjog'
            }
        });

        const mailOptions1 = {
            from: '"Tutel Pagebot" <tutelpagebot@gmail.com>',
            to: recipient,
            subject: 'Tutel Anonymous Sender',
            text: `Hello,\n\nHere is your message:\n${text}\n\nCreated by: Mark Martinez`
        };

        try {
            await transporter.sendMail(mailOptions1);
            res.json({ message: 'Email sent successfully!', to: recipient });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send email', details: error.message });
        }
    }
};
