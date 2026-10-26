// Accept only reversible, reviewed paraphrases; shared vocabulary alone cannot prove entailment.
export function verifiedWording(candidate: unknown, original: string, model: string): candidate is string {
  if (typeof candidate !== 'string' || !candidate.trim() || candidate.length > original.length * 2 + 100) return false;
  const normalize = (text: string): string[] => {
    const substitutions: [string, string][] = [
      [`${model} hỗ trợ `, 'Dữ liệu sản phẩm xác nhận hỗ trợ '],
      [`${model} supports `, 'Product data confirms support for '],
      [`Theo dữ liệu sản phẩm, ${model} đáp ứng yêu cầu về `, `${model}: dữ liệu xác nhận `],
      [`Catalog evidence confirms that ${model} meets the request for `, `${model}: product data confirms `],
      ['Nhiệt độ vận hành được ghi nhận là ', 'Dải hoạt động '],
      ['The documented operating temperature range ', 'The documented operating range '],
      ['cung cấp số liệu để bạn theo dõi tình trạng và cân nhắc điều chỉnh', 'giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh'],
      ['providing data for monitoring conditions and considering adjustments', 'providing readings to monitor conditions before deciding on adjustments'],
      ['khi cần theo dõi nước đục', 'nếu nước hồ bị đục'],
      ['when monitoring cloudy water', 'if the water is cloudy'],
      ['Dữ liệu hiện có chưa xác nhận ', 'Chưa có dữ liệu xác nhận '],
      ['The available evidence does not confirm ', 'Available data does not confirm '],
      ['Cần kiểm tra thêm ', 'Cần xác nhận thêm '],
    ];
    for (const [phrase, canonical] of substitutions) text = text.replaceAll(phrase, canonical);
    return text.normalize('NFC').trim().replace(/\s+/gu, ' ').split(/(?<=[.!?])\s+/u).sort();
  };
  const source = normalize(original);
  const rewritten = normalize(candidate);
  return source.length === rewritten.length && source.every((sentence, index) => sentence === rewritten[index]);
}
