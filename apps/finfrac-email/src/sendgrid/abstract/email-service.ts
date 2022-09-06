import * as fs from 'fs';
import * as ejs from 'ejs';

export abstract class EmailService {
  abstract sendEmail(options: Record<string, any>);
  
  abstract validateOptions(options: Record<string, any>);
  
  async getHtmlFromEmailTemplate(content, templateUrl) {
    try {
      return new Promise((resolve, reject) => {
        fs.readFile(templateUrl, 'utf8', (err, file) => {
          if (err) {
            throw err;
          }
          const html = ejs.render(file, {
            ...content
          });
          return resolve(html);
        });
      });
    } catch (e) {
      console.log('email :::: ', e);
      throw e;
    }
  }
}
