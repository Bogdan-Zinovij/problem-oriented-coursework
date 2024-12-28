import {
  BlobDeleteResponse,
  BlobServiceClient,
  BlobUploadCommonResponse,
  BlockBlobParallelUploadOptions,
} from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, BadRequestException } from '@nestjs/common';
import { join, parse } from 'node:path';
import { STORAGE_DEFAULT_UPLOAD_OPTIONS } from './storage.constants';
import { ImageEntity } from 'src/modules/images/image.entity';
import { AppErrorMessagesEnum } from 'src/common/enums';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class StorageService {
  private readonly client: BlobServiceClient;
  private readonly blobContainerName: string;

  constructor(private readonly appConfigService: AppConfigService) {
    const connectionString = this.appConfigService.get<string>(
      'AZURE_BLOB_STORAGE_CONNECTION_STRING',
    );

    this.client = BlobServiceClient.fromConnectionString(connectionString);
    this.blobContainerName = this.appConfigService.get<string>(
      'AZURE_BLOB_STORAGE_CONTAINER_NAME',
    );
  }

  async createOne(
    file: any,
    pathToFile: string,
    options?: BlockBlobParallelUploadOptions,
  ): Promise<Partial<ImageEntity>> {
    const { originalname: filename, mimetype } = file;

    const uploadOptions = options ?? {
      blobHTTPHeaders: { blobContentType: mimetype },
    };

    const { name, ext } = parse(filename);
    const randomUuid = uuidv4();
    const filePath = join(pathToFile, `${randomUuid}${ext}`).replace(
      /\\/g,
      '/',
    );

    await this.uploadOne(file, filePath, uploadOptions);

    return {
      fileName: name,
      fileNameWithExt: filename,
      fileExt: ext,
      filePath,
      mimetype,
    } as Partial<ImageEntity>;
  }

  async uploadOne(
    file: any,
    filePath: string,
    options: BlockBlobParallelUploadOptions = STORAGE_DEFAULT_UPLOAD_OPTIONS,
  ): Promise<BlobUploadCommonResponse> {
    const containerClient = this.client.getContainerClient(
      this.blobContainerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(filePath);

    return blockBlobClient.uploadData(file.buffer, options).catch((err) => {
      console.log(err);
      throw new BadRequestException(AppErrorMessagesEnum.IMAGE_UPLOAD_ERROR);
    });
  }

  async deleteOne(filePath: string): Promise<BlobDeleteResponse> {
    const containerClient = this.client.getContainerClient(
      this.blobContainerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(filePath);

    return blockBlobClient.delete().catch(() => {
      throw new BadRequestException(AppErrorMessagesEnum.IMAGE_DELETION_ERROR);
    });
  }
}
