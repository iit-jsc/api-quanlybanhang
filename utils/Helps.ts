import { TokenPayload } from "./../interfaces/common.interface";
import { generate as generateIdentifier } from "short-uuid";
import { PaginationResult } from "interfaces/common.interface";
import { ACCOUNT_TYPE } from "enums/user.enum";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import ShortUniqueId from "short-unique-id";

export function generateUniqueId(): string {
  return generateIdentifier();
}

export function generateSortCode(): string {
  var uid = new ShortUniqueId({
    dictionary: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ],
  });

  var uid = new ShortUniqueId({ dictionary: "hex" });

  return uid.randomUUID(10).toUpperCase();
}

export function calculatePagination(totalRecords: number, skip: number, take: number): PaginationResult {
  const totalPages = Math.ceil(totalRecords / take);
  const currentPage = totalPages === 0 ? 0 : Math.floor(skip / take) + 1;

  return {
    totalRecords,
    totalPages,
    currentPage,
  };
}

export function roleBasedBranchFilter(tokenPayload: TokenPayload) {
  const baseConditions = {
    isPublic: true,
    shop: {
      id: tokenPayload.shopId,
      isPublic: true,
    },
  };

  return tokenPayload.type !== ACCOUNT_TYPE.STORE_OWNER
    ? {
        ...baseConditions,
        id: tokenPayload.branchId,
      }
    : baseConditions;
}

export function onlyBranchFilter(tokenPayload: TokenPayload) {
  return {
    id: tokenPayload.branchId,
    isPublic: true,
  };
}

export function detailPermissionFilter(tokenPayload: TokenPayload) {
  return {
    some: {
      isPublic: true,
      branchId: tokenPayload.branchId,
    },
  };
}

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error("Only image files are allowed!"), false);
  }
  callback(null, true);
};

const maxSize = 200 * 1024 * 1024;

export const CustomFileInterceptor = (
  fieldName: string,
  destinationPath: string = "./uploads",
  fileSize: number = maxSize,
) =>
  FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: destinationPath,
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join("");
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize },
  });

export function CustomFilesInterceptor(
  fieldName: string,
  maxFiles: number,
  destinationPath: string = "./uploads",
  fileSize: number = maxSize,
) {
  return FilesInterceptor(fieldName, maxFiles, {
    storage: diskStorage({
      destination: destinationPath,
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join("");
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize },
  });
}
