const express = require('express');
const nodemailer = require('nodemailer');

const handlebars = require('handlebars');
const fs = require('fs');

async function sendQueueStatusEmail(email, subjectContent, templateData) {
  try {
    const htmlTemplatePath = './templates/queue.html';
    const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(htmlTemplate);
    const renderedTemplate = compiledTemplate(templateData);

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'kinegaofficial@gmail.com',
        pass: 'buzpitfowyqigedj',
      },
    });

    let mailOptions = {
      from: 'kinegaofficial@gmail.com',
      to: email,
      subject: subjectContent,
      html: renderedTemplate,
    };

    let info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}


//This is about position change
async function sendPositionChangeEmail(email, subjectContent, templateData) {
  try {
    const htmlTemplatePath = './templates/positionChange.html';
    const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(htmlTemplate);
    const renderedTemplate = compiledTemplate(templateData);

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'kinegaofficial@gmail.com',
        pass: 'buzpitfowyqigedj',
      },
    });

    let mailOptions = {
      from: 'kinegaofficial@gmail.com',
      to: email,
      subject: subjectContent,
      html: renderedTemplate,
    };

    let info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendQueueStatusEmail };
