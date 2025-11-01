"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Skip seeding if table already has rows
    const [results] = await queryInterface.sequelize.query("SELECT COUNT(*) as count FROM faqs;");
    const existingCount = results && results[0] && (results[0].count || results[0]['COUNT(*)']);
    if (Number(existingCount) > 0) {
      return Promise.resolve();
    }

    const now = new Date();
    const faqs = [
      {
        question: 'How do I reset my password?',
        answer: 'To reset your password, go to the login page and click "Forgot password". Follow the instructions that will be emailed to you.',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        question: 'How do I change my email address?',
        answer: 'You can change your email from your profile settings. Verify the new email when prompted.',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        question: 'How do I contact support?',
        answer: 'Send an email to support@example.com or use the contact form in the app.',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        question: 'Can I change my username?',
        answer: 'Yes, usernames can be changed once every 30 days from your profile page.',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        question: 'What is two-factor authentication?',
        answer: 'Two-factor authentication (2FA) adds an additional layer of security to your account by requiring a second verification step.',
        is_active: false,
        created_at: now,
        updated_at: now
      },
      {
        question: 'How do I delete my account?',
        answer: 'To delete your account, contact support and include your account email for verification.',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    return queryInterface.bulkInsert('faqs', faqs, {});
  },

  down: async (queryInterface, Sequelize) => {
    const questions = [
      'How do I reset my password?',
      'How do I change my email address?',
      'How do I contact support?',
      'Can I change my username?',
      'What is two-factor authentication?',
      'How do I delete my account?'
    ];

    return queryInterface.bulkDelete('faqs', { question: { [Sequelize.Op.in]: questions } }, {});
  }
};
