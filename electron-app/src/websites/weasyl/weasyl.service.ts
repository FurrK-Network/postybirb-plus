import * as _ from 'lodash';
import Http from 'src/http/http.util';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { LoginResponse } from 'src/websites/interfaces/login-response.interface';
import { Submission } from 'src/submission/interfaces/submission.interface';
import {
  SubmissionPart,
  DefaultOptions,
} from 'src/submission/interfaces/submission-part.interface';
import { UserAccount } from 'src/account/account.interface';
import { WebsiteService } from 'src/websites/website.service';
import WebsiteValidator from 'src/websites/utils/website-validator.util';
import { FileSubmission } from 'src/submission/file-submission/interfaces/file-submission.interface';
import { FileSubmissionType } from 'src/submission/file-submission/enums/file-submission-type.enum';
import { DEFAULT_FILE_SUBMISSION_OPTIONS } from './weasyl.defaults';
import { DefaultWeasylSubmissionOptions } from './weasyl.interface';
import { Folder } from 'src/websites/interfaces/folder.interface';

@Injectable()
export class Weasyl extends WebsiteService {
  private readonly logger = new Logger(Weasyl.name);

  readonly BASE_URL: string = 'https://www.weasyl.com';
  readonly acceptsFiles: string[] = ['jpg', 'jpeg', 'png', 'gif', 'md', 'txt', 'pdf', 'swf', 'mp3'];

  readonly defaultStatusOptions: any = {};
  readonly defaultFileSubmissionOptions: DefaultWeasylSubmissionOptions = DEFAULT_FILE_SUBMISSION_OPTIONS;

  parseDescription(text: string): string {
    throw new NotImplementedException('Method not implemented.');
  }

  postStatusSubmission(data: any): Promise<any> {
    throw new NotImplementedException('Method not implemented.');
  }

  postFileSubmission(data: any): Promise<any> {
    throw new NotImplementedException('Method not implemented.');
  }

  async checkLoginStatus(data: UserAccount): Promise<LoginResponse> {
    const res = await Http.get<any>(`${this.BASE_URL}/api/whoami`, data.id, {
      requestOptions: { json: true },
    });
    const status: LoginResponse = { loggedIn: false, username: null };
    try {
      const login: string = _.get(res.body, 'login');
      status.loggedIn = !!login;
      status.username = login;
      await this.retrieveFolders(data.id, status.username);
    } catch (e) {
      /* Swallow */
    }
    return status;
  }

  async retrieveFolders(id: string, loginName: string): Promise<void> {
    const res = await Http.get<{ folders: any[] }>(
      `${this.BASE_URL}/api/users/${loginName}/view`,
      id,
      {
        requestOptions: { json: true },
      },
    );

    const convertedFolders: Folder[] = [];

    const folders = res.body.folders || [];
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      const _folder: Folder = {
        title: folder.title,
        id: folder.folder_id,
      };

      convertedFolders.push(_folder);

      if (folder.subfolders) {
        for (let j = 0; j < folder.subfolders.length; j++) {
          const subfolder = folder.subfolders[j];
          const _subfolder: Folder = {
            title: `${_folder.title} / ${subfolder.title}`,
            id: subfolder.folder_id,
          };

          convertedFolders.push(_subfolder);
        }
      }
    }

    this.accountInformation.set(id, { folders: convertedFolders });
  }

  validateFileSubmission(
    submission: FileSubmission,
    submissionPart: SubmissionPart<DefaultWeasylSubmissionOptions>,
    defaultPart: SubmissionPart<DefaultOptions>,
  ): string[] {
    const problems: string[] = [];

    if (!WebsiteValidator.supportsFileType(submission.primary, this.acceptsFiles)) {
      problems.push(`Weasyl does not support file format: ${submission.primary.mimetype}.`);
    }

    if (WebsiteValidator.getTags(defaultPart.data.tags, submissionPart.data.tags).length < 2) {
      problems.push('Weasyl requires at least 2 tags.');
    }

    const { type, size, name } = submission.primary;
    let maxMB: number = 10;
    if (type === FileSubmissionType.VIDEO || type === FileSubmissionType.AUDIO) {
      maxMB = 15;
    } else if (type === FileSubmissionType.TEXT) {
      if (name.includes('.md') || name.includes('.md')) {
        maxMB = 2;
      } else {
        maxMB = 10; // assume pdf
      }
    }

    if (WebsiteValidator.MBtoBytes(maxMB) < size) {
      problems.push(`Weasyl limits ${type} to ${maxMB}MB`);
    }

    return problems;
  }

  validateStatusSubmission(submission: Submission, submissionPart: SubmissionPart<any>): string[] {
    throw new NotImplementedException('Method not implemented.');
  }
}