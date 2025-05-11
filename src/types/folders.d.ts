// JSON モジュールの型宣言を拡張
declare module "*.json" {
  const value: FolderInfo[];
  export default value;
}

// フォルダ情報の型定義
export interface FolderInfo {
  path: string;
  title: string;
  date: string;
  description: string;
  maxImages: number;
} 