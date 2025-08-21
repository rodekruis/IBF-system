import { MailerOptions, TemplateAdapter } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { TemplateAdapterConfig } from '@nestjs-modules/mailer/dist/interfaces/template-adapter-config.interface';

import { compile } from 'ejs';
import { readFileSync } from 'fs';
import { HelperDeclareSpec } from 'handlebars';
import mjml2html from 'mjml';
import path from 'path';

interface MailData {
  context: Record<string, string>;
  template: string;
  html: string;
}

export class MjmlAdapter implements TemplateAdapter {
  private engine: TemplateAdapter | null;

  constructor(
    engine: TemplateAdapter | '' | 'pug' | 'handlebars' | 'ejs',
    config?: TemplateAdapterConfig,
    others?: { handlebar?: { helper?: HelperDeclareSpec } },
  ) {
    this.engine = engine as TemplateAdapter;

    if (typeof engine == 'string') {
      if (engine === 'pug') {
        this.engine = new PugAdapter(config);
      } else if (engine === 'handlebars') {
        this.engine = new HandlebarsAdapter(others.handlebar.helper, config);
      } else if (engine === 'ejs') {
        this.engine = new EjsAdapter(config);
      } else if (engine === '') {
        engine = null;
      }
    }
  }

  public compile(
    mail: { data: MailData },
    callback: () => void,
    mailerOptions: MailerOptions,
  ) {
    const { context, template } = mail.data;
    const templatePath = path.join(
      mailerOptions.template.dir,
      `${template}.mjml`,
    );

    const templateFile = readFileSync(templatePath, 'utf-8');

    this?.engine?.compile(
      mail,
      () => {
        // convert MJML to HTML
        let html = mjml2html(templateFile).html;
        // fill data into HTML using ejs
        html = compile(html)(context);
        mail.data.html = html;
        callback();
      },
      mailerOptions,
    );
  }
}
