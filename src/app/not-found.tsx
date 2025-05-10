import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-6">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        ページが見つかりませんでした
      </h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mb-8">
        お探しのページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
