import { z } from 'zod';
import { ArticleCategory, UserRoles } from './utils/userInterface';

// ------------- USER SCHEMAS -----------------

// User registration schema validation
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required').max(40),
  lastName: z.string().min(2, 'Last name is required').max(40),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  gender: z.enum(['male', 'female'], 'Gender must be either male or female'),
  jobRole: z.enum(
    [UserRoles.Admin, UserRoles.Employee],
    'The requested job role is invalid'
  ),
  department: z.string().min(1, 'Department is required'),
  address: z.string().min(1, 'Address is required'),
});

export const registrationSchemaDTO = z.object({
  body: registerSchema,
});

// User Signin schema validation
export const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const signInSchemaDTO = z.object({
  body: signInSchema,
});

// Forgot Password schema validation
export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});

export const forgotPasswordSchemaDTO = z.object({
  body: forgotPasswordSchema,
});

// Reset Password schema validation
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long'),
  confirmNewPassword: z.string().min(6, 'Please confirm your new password'),
});

export const resetPasswordSchemaDTO = z.object({
  body: resetPasswordSchema,
  params: z.object({
    userId: z.string().min(1, 'User id is required'),
    token: z.string().min(1, 'Reset token is required'),
  }),
});

// Edit User schema validation
export const editUserSchema = z.object({
  firstName: z.preprocess(
    (value) => (value === '' || undefined ? undefined : value),
    z
      .string()
      .optional()
      .refine(
        (value) =>
          value === undefined || (value.length >= 2 && value.length <= 40),
        {
          message: 'First name must be between 2 and 40 characters long',
        }
      )
  ),
  lastName: z.preprocess(
    (value) => (value === '' || undefined ? undefined : value),
    z
      .string()
      .optional()
      .refine(
        (value) =>
          value === undefined || (value.length >= 2 && value.length <= 40),
        {
          message: 'Last name must be between 2 and 40 characters long',
        }
      )
  ),
  gender: z.preprocess(
    (value) => (value === '' || undefined ? undefined : value),
    z
      .enum(['male', 'female'], 'Gender must be either male or female')
      .optional()
      .refine(
        (value) => value === undefined || value === 'male' || value === 'female'
      )
  ),
  department: z.preprocess(
    (value) => (value === '' || undefined ? undefined : value),
    z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length >= 3, {
        message: 'Department is required',
      })
  ),
  address: z.preprocess(
    (value) => (value === '' || undefined ? undefined : value),
    z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length >= 3, {
        message: 'Address is required',
      })
  ),
});

export const editUserSchemaDTO = z.object({
  body: editUserSchema,
});

// Change Password schema validation

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long'),
  confirmNewPassword: z.string().min(6, 'Please confirm your new password'),
});

export const changePasswordSchemaDTO = z.object({
  body: changePasswordSchema,
});

// ------------------- GIF SCHEMAS --------------------

// Gif POST schema validation
export const postGifSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
});

export const postGifSchemaDTO = z.object({
  body: postGifSchema,
});

// DELETE GIF SCHEMA
export const deleteGifSchema = z.object({
  gifId: z.coerce
    .number('Invalid GIF ID')
    .int('Invalid GIF ID')
    .positive('Invalid GIF ID'),
});

export const deleteGifSchemaDTO = z.object({
  params: deleteGifSchema,
});

// FETCH GIFS SCHEMAS
export const fetchAllGifsSchemaDTO = z.object({
  query: z.object({
    page: z.coerce
      .number('Invalid page')
      .int('Invalid page')
      .positive('Invalid page'),
    limit: z.coerce
      .number('Invalid limit')
      .int('Invalid limit')
      .positive('Invalid limit'),
  }),
});

export const fetchUserGifsSchemaDTO = z.object({
  params: z.object({
    creatorId: z.coerce
      .number('Invalid creator ID')
      .int('Invalid creator ID')
      .positive('Invalid creator ID'),
    page: z.coerce
      .number('Invalid page')
      .int('Invalid page')
      .positive('Invalid page'),
  }),
});

export const fetchGifSchemaDTO = z.object({
  params: z.object({
    gifId: z.coerce
      .number('Invalid GIF ID')
      .int('Invalid GIF ID')
      .positive('Invalid GIF ID'),
  }),
});

// GIF LIKE SCHEMA
export const gifLikeSchema = z.object({
  gifId: z.coerce
    .number('Invalid GIF ID')
    .int('Invalid GIF ID')
    .positive('Invalid GIF ID'),
});

export const gifLikeSchemaDTO = z.object({
  params: gifLikeSchema,
});

// GIF COMMENT SCHEMA
export const gifCommentSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long'),
});

export const gifCommentSchemaDTO = z.object({
  body: gifCommentSchema,
  params: z.object({
    gifId: z.coerce
      .number('Invalid GIF ID')
      .int('Invalid GIF ID')
      .positive('Invalid GIF ID'),
  }),
});

// FETCH GIF COMMENT SCHEMAS
export const fetchGifCommentSchemaDTO = z.object({
  params: z.object({
    gifId: z.coerce
      .number('Invalid GIF ID')
      .int('Invalid GIF ID')
      .positive('Invalid GIF ID'),
    page: z.coerce
      .number('Invalid page')
      .int('Invalid page')
      .positive('Invalid page'),
  }),
});

export const editGifCommentSchemaDTO = z.object({
  body: gifCommentSchema,
  params: z.object({
    commentId: z.coerce
      .number('Invalid comment ID')
      .int('Invalid comment ID')
      .positive('Invalid comment ID'),
  }),
});

export const deleteGifCommentSchemaDTO = z.object({
  params: z.object({
    commentId: z.coerce
      .number('Invalid comment ID')
      .int('Invalid comment ID')
      .positive('Invalid comment ID'),
  }),
});

// ARTICLES SCHEMAS
export const postArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required').max(800),
  category: z.enum(
    [
      ArticleCategory.Business,
      ArticleCategory.Education,
      ArticleCategory.Entertainment,
      ArticleCategory.Sports,
      ArticleCategory.Technology,
      ArticleCategory.Uncategorized,
    ],
    'Invalid category'
  ),
});

export const postArticleSchemaDTO = z.object({
  body: postArticleSchema,
});

export const editArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required').max(800),
});

// EDIT ARTICLE SCHEMA
export const editArticleSchemaDTO = z.object({
  body: editArticleSchema,
  params: z.object({
    articleId: z.coerce
      .number('Invalid article ID')
      .int('Invalid article ID')
      .positive('Invalid article ID'),
  }),
});

// DELETE ARTICLE SCHEMA
export const deleteArticleSchema = z.object({
  articleId: z.coerce
    .number('Invalid ARTICLE ID')
    .int('Invalid ARTICLE ID')
    .positive('Invalid ARTICLE ID'),
});

export const deleteArticleSchemaDTO = z.object({
  params: deleteArticleSchema,
});

export const fetchAllArticlesSchema = z.object({
  page: z.coerce
    .number('Invalid page')
    .int('Invalid page')
    .positive('Invalid page'),
  limit: z.coerce
    .number('Invalid limit')
    .int('Invalid limit')
    .positive('Invalid limit'),
});

export const fetchAllArticlesSchemaDTO = z.object({
  query: fetchAllArticlesSchema,
});

export const fetchUserArticlesSchema = z.object({
  creatorId: z.coerce
    .number('Invalid creator id')
    .int('Invalid creator id')
    .positive('Invalid creator id'),
  page: z.coerce
    .number('Invalid page')
    .int('Invalid page')
    .positive('Invalid page'),
});

export const fetchUserArticlesSchemaDTO = z.object({
  params: fetchUserArticlesSchema,
});

export const fetchCategoryArticle = z.object({
  category: z.enum(
    [
      ArticleCategory.Business,
      ArticleCategory.Education,
      ArticleCategory.Entertainment,
      ArticleCategory.Sports,
      ArticleCategory.Technology,
      ArticleCategory.Uncategorized,
    ],
    'Invalid category'
  ),
  page: z.coerce
    .number('Invalid page')
    .int('Invalid page')
    .positive('Invalid page'),
});

export const fetchCategoryArticleDTO = z.object({
  params: fetchCategoryArticle,
});

export const fetchSingleArticleSchemaDTO = z.object({
  params: z.object({
    articleId: z.coerce
      .number('Invalid article ID')
      .int('Invalid article ID')
      .positive('Invalid article ID'),
  }),
});

export const articleLikeSchemaDTO = z.object({
  params: z.object({
    articleId: z.coerce
      .number('Invalid article ID')
      .int('Invalid article ID')
      .positive('Invalid article ID'),
  }),
});

export const articleCommentSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long'),
});

export const articleCommentSchemaDTO = z.object({
  body: articleCommentSchema,
  params: z.object({
    articleId: z.coerce
      .number('Invalid article ID')
      .int('Invalid article ID')
      .positive('Invalid article ID'),
  }),
});

export const fetchArticleCommentSchemaDTO = z.object({
  params: z.object({
    articleId: z.coerce
      .number('Invalid article ID')
      .int('Invalid article ID')
      .positive('Invalid article ID'),
    page: z.coerce
      .number('Invalid page')
      .int('Invalid page')
      .positive('Invalid page'),
  }),
});

export const editArticleCommentSchemaDTO = z.object({
  body: articleCommentSchema,
  params: z.object({
    commentId: z.coerce
      .number('Invalid comment ID')
      .int('Invalid comment ID')
      .positive('Invalid comment ID'),
  }),
});

export const deleteArticleCommentSchemaDTO = z.object({
  params: z.object({
    commentId: z.coerce
      .number('Invalid comment ID')
      .int('Invalid comment ID')
      .positive('Invalid comment ID'),
  }),
});

export const fetchAllPostsSchemaDTO = z.object({
  query: z.object({
    page: z.coerce
      .number('Invalid page')
      .int('Invalid page')
      .positive('Invalid page'),
  }),
});
