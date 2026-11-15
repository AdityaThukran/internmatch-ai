const nodemailer = require('nodemailer');
const config = require('../config/config');

/**
 * Create nodemailer transporter from env config.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailPort === 465,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });
};

/**
 * Send an email.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 * @returns {object} { success: boolean, messageId?: string, error?: string }
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"Internship Finder" <${config.emailUser}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email send error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send an internship match alert email with warm-themed HTML template.
 * @param {object} user - User object with name and email
 * @param {object} internship - Internship object
 * @param {number} matchScore - Match score (0-100)
 * @returns {object} Send result
 */
const sendInternshipAlert = async (user, internship, matchScore) => {
  const subject = `🎯 New Internship Match: ${internship.title} at ${internship.organization}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FF8C42, #FF6B35); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">🎓 Internship Finder</h1>
          <p style="color: #FFE0C2; margin: 8px 0 0 0; font-size: 14px;">Your personalized internship match</p>
        </div>
        
        <!-- Body -->
        <div style="background-color: #FFFFFF; padding: 30px; border-left: 1px solid #FFE0C2; border-right: 1px solid #FFE0C2;">
          <h2 style="color: #333333; margin-top: 0;">Hi ${user.name}! 👋</h2>
          <p style="color: #555555; line-height: 1.6;">
            We found a new internship that matches your profile! Here are the details:
          </p>
          
          <!-- Match Score Badge -->
          <div style="text-align: center; margin: 20px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #FF8C42, #FF6B35); color: white; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 24px; font-weight: bold;">
              ${matchScore}%
            </div>
            <p style="color: #FF6B35; font-weight: 600; margin: 8px 0 0 0;">Match Score</p>
          </div>
          
          <!-- Internship Details Card -->
          <div style="background-color: #FFF5EB; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF8C42;">
            <h3 style="color: #333333; margin-top: 0; font-size: 18px;">${internship.title}</h3>
            <p style="color: #666666; margin: 4px 0;">🏢 <strong>${internship.organization}</strong></p>
            <p style="color: #666666; margin: 4px 0;">📍 ${internship.location || 'Location not specified'}</p>
            <p style="color: #666666; margin: 4px 0;">💼 ${internship.mode ? internship.mode.charAt(0).toUpperCase() + internship.mode.slice(1) : 'Not specified'}</p>
            <p style="color: #666666; margin: 4px 0;">💰 ${internship.stipend || 'Stipend not specified'}</p>
            <p style="color: #666666; margin: 4px 0;">⏱️ ${internship.duration || 'Duration not specified'}</p>
            ${internship.skills && internship.skills.length > 0 ? `
            <div style="margin-top: 12px;">
              <strong style="color: #555555;">Skills:</strong>
              <div style="margin-top: 6px;">
                ${internship.skills.map((skill) => `<span style="display: inline-block; background-color: #FFE0C2; color: #CC5500; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin: 2px 4px 2px 0;">${skill}</span>`).join('')}
              </div>
            </div>` : ''}
          </div>
          
          <!-- CTA Button -->
          ${internship.applyUrl ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${internship.applyUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF8C42, #FF6B35); color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Apply Now →
            </a>
          </div>` : ''}
          
          <p style="color: #888888; font-size: 13px; line-height: 1.5;">
            ${internship.deadline ? `⏰ Deadline: ${new Date(internship.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #FFF0E0; border-radius: 0 0 12px 12px; padding: 20px; text-align: center; border-left: 1px solid #FFE0C2; border-right: 1px solid #FFE0C2; border-bottom: 1px solid #FFE0C2;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            You received this email because you have email notifications enabled.<br>
            <a href="${config.clientUrl}/settings" style="color: #FF8C42;">Manage notification preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, subject, html);
};

module.exports = {
  createTransporter,
  sendEmail,
  sendInternshipAlert,
};
