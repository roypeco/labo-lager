import { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

// 環境変数からアクセスキーとシークレットキーを設定
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION // リージョンも環境変数から取得
});

const s3 = new AWS.S3();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // クエリパラメータからS3キーを取得しデコード
        const key = decodeURIComponent(req.query.key as string);

        console.log(key);
        const params = {
            Bucket: 'labolager-bucket', // あなたのS3バケット名
            Key: key, 
            Expires: 60 // URLの有効期限（秒）
        };

        // プリサインドURLを取得
        const url = await s3.getSignedUrlPromise('getObject', params);

        res.status(200).json({ url });
    } catch (error) {
        console.error('Error getting presigned URL:', error);
        res.status(500).json({ error: 'Error getting presigned URL' });
    }
}
