import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { SearchResponseSchema } = require('@reeco/shared');
const directory = 'output/explanation-cases';
const responses = JSON.parse(await readFile(`${directory}/responses.json`, 'utf8'));
const catalog = JSON.parse(await readFile(`${directory}/catalog-evidence.json`, 'utf8'));
const aliases = { 'soil moisture': 'volumetric_water_content', rainfall: 'precipitation', 'relative humidity': 'relative_humidity', 'soil temperature': 'soil_temperature', 'air temperature': 'air_temperature', turbidity: 'turbidity' };
const groundingIssues = [];
let evidenceEntries = 0;
for (const response of responses) for (const product of response.body?.results || []) for (const evidence of product.explanation?.evidence || []) {
  evidenceEntries++;
  const detail = catalog[product.product_id]?.body;
  const value = evidence.field === 'taxonomy.device_type' ? detail?.taxonomy?.device_type : detail?.[evidence.field];
  const normalize = text => text.normalize('NFC').toLowerCase();
  const confirmed = evidence.field === 'measurements'
    ? detail?.measurements?.some(item => [item.label_en, item.label_vi].some(label => normalize(label) === normalize(evidence.value))
      || item.key === aliases[evidence.value.split(' / ')[0].toLowerCase()])
    : typeof value === 'string' ? value === evidence.value : Array.isArray(value) && value.includes(evidence.value);
  if (!confirmed) groundingIssues.push({ id: response.id, language: response.language, model: product.model, evidence });
}
assert.equal(responses.length, 140);
assert.equal(new Set(responses.map(r => `${r.id}:${r.language}`)).size, 140);
const notes = {
  WATER: [
    'ClariVue10 liên kết độ đục với theo dõi nước; CS511 được mô tả là chỉ số bổ sung, không phải thiết bị làm sạch.',
    'Có ClariVue10 nhưng lẫn cảm biến mực nước/lá ướt; chưa phân biệt nhu cầu theo dõi độ đục theo thời gian.',
    'Đúng độ đục nhưng chưa đối chiếu thông số ngoài trời và yêu cầu đo liên tục.',
    'Có cảm biến độ đục/oxy, giải thích vai trò và giới hạn; không khẳng định tự cảnh báo hay tự xử lý.',
    'VI lẫn cảm biến mưa và mực nước; EN chỉ trả cảm biến mưa, bỏ độ đục cần đo.',
    'Đúng nhóm nước nhưng thiếu căn cứ triển khai vùng xa, bảo trì và vận hành lâu dài.',
    'VI chỉ có độ đục; EN rỗng. Thiếu phối hợp cảm biến mưa và độ đục.',
    'Chỉ mô tả taxonomy, không đối chiếu thời gian hoạt động và yêu cầu bảo trì.',
    'VI giải thích độ đục nhưng không so sánh với mực nước; EN chỉ xác nhận độ đục.',
    'Cả VI và EN rỗng; chưa phân biệt nhiệt độ của đầu đo độ đục với nhiệt độ nước được xác nhận.',
  ],
  SOIL: [
    'VI có cảm biến ẩm đất nhưng top 1 là LWS; EN phần lớn chỉ taxonomy, không nối water stress với nhu cầu đo ẩm đất.',
    'Lẫn LWS/nhiệt độ đất; chưa mô tả ngưỡng đất khô, bộ điều khiển và phần đóng/ngắt tưới.',
    'Có cảm biến ẩm đất nhưng lẫn máy đo cầm tay HS2-12; chưa xử lý rõ yêu cầu theo dõi liên tục.',
    'Top 1 LWS không đo độ ẩm đất; các giải thích chưa ánh xạ tình trạng quá ướt sau tưới.',
    'VI bỏ điều kiện độ ẩm và đưa TCAV/105E chỉ đo nhiệt độ; EN xác nhận đồng thời soil moisture và soil temperature.',
    'Chưa giải thích bố trí nhiều điểm, so sánh dữ liệu đồng bộ và bộ ghi; còn lẫn LWS/nhiệt độ đất.',
    'Có đo nước thể tích nhưng lẫn thiết bị không đo ẩm đất; chưa giải thích cách hỗ trợ giảm tưới mà tránh stress.',
    'Thiếu chứng cứ chôn đất, độ bền ngoài trời và thời gian nhiều tháng.',
    'VI rỗng; EN trả thiết bị thời tiết, không trả lời so sánh với đo ẩm đất.',
    'VI lẫn nhiều chức năng; EN chỉ lượng mưa. Chưa nối thấm nước với đo ẩm đất theo độ sâu/thời gian.',
  ],
  WEATHER: [
    'Liệt kê cảm biến thời tiết đa đại lượng, có measurement evidence và nêu chưa xác nhận cấu hình lắp đặt.',
    'Ưu tiên TB4/52202 đo lượng mưa thực tế, có căn cứ measurement/taxonomy; không khẳng định đo dự báo.',
    'Có sản phẩm gió nhưng chưa xác nhận đồng thời tốc độ và hướng gió; top WindSonic1 chỉ giải thích taxonomy.',
    'Xác nhận cả nhiệt độ và độ ẩm không khí, có evidence và giới hạn cấu hình.',
    'VI top LWS sai vai trò; EN có bức xạ nhưng chưa giải thích tích lũy theo ngày và liên quan ánh sáng cây nhận.',
    'Chỉ taxonomy, chưa giải thích lưu cực đại gió hoặc tốc độ lấy mẫu/bộ ghi.',
    'VI chỉ cảm biến mưa, thiếu bộ ghi/nguồn/bảo trì; EN HTTP 400 vì “without personnel” bị xem là phủ định không hỗ trợ.',
    'Chưa nối đủ nhiệt độ, độ ẩm và mưa với nghiên cứu tương quan; VI trả cả cảm biến chỉ đo mưa.',
    'Không giải thích vai trò bổ sung mưa và ẩm đất; thiếu một nhóm hoặc trả rỗng.',
    'Đúng cảm biến mưa nhưng chưa trả lời có cần mua cả trạm hoàn chỉnh hay không.',
  ],
  DATALOGGER: [
    'VI xác định bộ ghi và phân biệt với cảm biến; EN top thiết bị thời tiết, chỉ taxonomy.',
    'Chưa chứng minh lưu cục bộ khi mất Internet; lẫn cảm biến và thiết bị Wi-Fi.',
    'Cả VI và EN rỗng; nhu cầu kết nối cảm biến bị xử lý như bộ ghi phải tự đo các đại lượng.',
    'Không đối chiếu nguồn, điều kiện môi trường và khả năng vận hành 24/7.',
    'Không có dung lượng, tần suất/bản ghi hoặc cách tính bộ nhớ cho vài tháng.',
    'Không có số kênh, loại tín hiệu hay căn cứ nối được 10 cảm biến.',
    'Giải thích bộ ghi ghi nhận dữ liệu và không thay thế cảm biến đo; có evidence phân loại thiết bị.',
    'Không xác nhận xử lý trung bình 10 phút và lưu cực đại bằng chứng cứ tính năng.',
    'Không đối chiếu đầu vào analog/digital hoặc giao thức hỗ trợ.',
    'Không so sánh số kênh/tài nguyên cần thiết cho 2 cảm biến với bộ ghi công suất lớn.',
  ],
  COMM: [
    'Không xác định nhu cầu xem từ xa thành truyền thông; top thiết bị thời tiết/trạm mặt trời.',
    'Có cellular modem nhưng chỉ xác nhận nhóm chức năng; không giải thích sóng di động, SIM/mạng và tương thích.',
    'Không làm rõ kênh truyền thay thế; có Wi-Fi/Ethernet mà chưa xác nhận hạ tầng ở nơi không Internet.',
    'VI trả trạm mặt trời, chưa mô tả chu kỳ gửi mỗi giờ/bộ ghi/kênh truyền; EN HTTP 400 vì “without visiting” bị xem là phủ định không hỗ trợ.',
    'Chưa mô tả nhiều trạm, thu tập trung và cấu hình truyền/định danh từng trạm.',
    'Chưa phân biệt mất mạng với mất dữ liệu lưu cục bộ; thiếu chứng cứ lưu và gửi lại.',
    'Không so sánh các lựa chọn Ethernet/Wi-Fi/cellular theo hạ tầng; xem lựa chọn thay thế như ràng buộc đồng thời.',
    'Thiếu chứng cứ vùng phủ, đường truyền và cấu hình thiết bị ở vùng núi.',
    'Chưa giải thích đầy đủ khác biệt lưu tại trạm và truyền để truy cập từ xa.',
    'Không đối chiếu dòng tiêu thụ/chế độ tiết kiệm điện hay phương án truyền.',
  ],
  SYSTEM: [
    'Chưa đưa đủ cảm biến nước → bộ ghi → truyền thông để xem từ nhà.',
    'Chưa phân rã ẩm đất, mưa, nhiệt độ thành hệ nhiều thiết bị; lọc điều kiện đồng thời gây thiếu/rỗng.',
    'Chưa đưa đủ cảm biến thời tiết, bộ ghi, nguồn ngoài lưới và truyền Internet.',
    'Chưa đề xuất phối hợp đo mưa và ẩm đất cùng mốc thời gian.',
    'Chưa đề xuất phối hợp mưa, độ đục và bộ ghi để phân tích tương quan.',
    'Không có đánh giá ngân sách năng lượng, lưu dữ liệu, nguồn và bảo trì sáu tháng.',
    'Chưa phân biệt và đề xuất cả ghi/lưu dữ liệu lẫn truyền về server.',
    'Chưa đưa đủ cảm biến ẩm đất, bộ ghi, truyền thông và cơ chế cảnh báo.',
    'Chưa mô tả chuỗi đo độ đục, kiểm tra ngưỡng, ghi và gửi cảnh báo.',
    'Chưa phân rã theo nhóm đại lượng môi trường, bộ ghi và truy cập từ xa.',
  ],
};
const passes = new Set(['WATER-001:vi', 'WATER-001:en', 'WATER-004:vi', 'WATER-004:en',
  'SOIL-005:en', 'WEATHER-001:vi', 'WEATHER-001:en', 'WEATHER-002:vi', 'WEATHER-002:en',
  'WEATHER-004:vi', 'WEATHER-004:en', 'DATALOGGER-001:vi', 'DATALOGGER-007:vi', 'DATALOGGER-007:en']);
const evaluations = responses.map(r => {
  const [, group, number] = r.id.split('-');
  return { ...r, contract_valid: !!r.body && SearchResponseSchema.safeParse(r.body).success,
    semantic_verdict: r.error || r.status !== 200 ? 'ERROR' : group === 'EXPLAIN' ? 'BLOCKED_CONTEXT' : passes.has(`${group}-${number}:${r.language}`) ? 'PASS' : 'FAIL',
    review: group === 'EXPLAIN' ? 'Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp.' : notes[group][Number(number) - 1] };
});
const count = predicate => evaluations.filter(predicate).length;
const summary = { queries: count(() => true), http200: count(r => r.status === 200), errors: count(r => r.error || r.status !== 200),
  empty: count(r => r.body?.results?.length === 0), contractValid: count(r => r.contract_valid),
  nonempty: count(r => r.checks?.nonempty), explanationPresent: count(r => r.checks?.explanation_present),
  evidencePresent: count(r => r.checks?.evidence_present), languageCorrect: count(r => r.checks?.language_correct),
  ruleExplanations: responses.flatMap(r => r.body?.results || []).filter(p => p.explanation?.source === 'rule').length,
  llmExplanations: responses.flatMap(r => r.body?.results || []).filter(p => p.explanation?.source === 'llm').length,
  catalogProductsChecked: Object.keys(catalog).length, evidenceEntries, groundingIssues: groundingIssues.length,
  pass: count(r => r.semantic_verdict === 'PASS'), fail: count(r => r.semantic_verdict === 'FAIL'), blockedContext: count(r => r.semantic_verdict === 'BLOCKED_CONTEXT') };
await writeFile(`${directory}/evaluations.json`, JSON.stringify({ generatedAt: new Date().toISOString(), summary, groundingIssues, evaluations }, null, 2));
const rows = [...new Set(evaluations.map(r => r.id))].map(id => {
  const vi = evaluations.find(r => r.id === id && r.language === 'vi');
  const en = evaluations.find(r => r.id === id && r.language === 'en');
  const models = r => r.body?.results?.map(p => p.model).join(', ') || r.error || '∅';
  return `| ${id} | ${vi.semantic_verdict} | ${en.semantic_verdict} | ${models(vi)} | ${models(en)} | ${vi.review} |`;
});
let report = `# Kết quả kiểm tra Explanation VI–EN\n\nThời điểm: ${new Date().toISOString()}. API: http://localhost:3000/api/v1/search.\n\nĐã gửi nguyên văn 70 case × 2 ngôn ngữ, limit=5, explain=true, không context, hai request đồng thời. Không sửa logic sản phẩm trong lượt kiểm tra. Đây là một snapshot API, không phải kiểm tra UI hay benchmark độ trễ dưới tải chuẩn.\n\n## Kết quả\n\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n\n129/129 kiểm thử hồi quy hiện có đạt, nhưng không thay thế 140 truy vấn nghiệp vụ này. HTTP 200, có evidence và đúng nhãn ngôn ngữ chỉ là kiểm tra cấu trúc.\n\n## Cách chấm\n\nPASS/FAIL là đánh giá nội dung thủ công của snapshot: thiết bị ưu tiên đúng nhu cầu, giải thích nối chức năng đã xác nhận với yêu cầu, không khẳng định đáp ứng phần chưa được chứng minh, đủ thành phần khi câu hỏi yêu cầu hệ thống. Evidence measurement/capability/taxonomy có thể đủ cho câu hỏi chức năng cơ bản; câu hỏi bộ nhớ, số kênh, ngoài trời, thời gian vận hành cần thông số tương ứng, taxonomy đơn thuần không đủ. PASS không có nghĩa mọi sản phẩm phụ là lựa chọn tối ưu, hoặc giải pháp đã đủ để lắp đặt.\n\nBLOCKED_CONTEXT: đã thực thi cả 20 query EXPLAIN, nhưng file không cung cấp sản phẩm hoặc ngữ cảnh để đánh giá tính phù hợp. Các case này cần fixture riêng; chưa tính PASS/FAIL nghiệp vụ. Câu hỏi có thể được đánh giá riêng về khả năng yêu cầu làm rõ.\n\nKhông dùng kiểm tra evidence có mặt để khẳng định tuyệt đối “không hallucination”. Response gốc giữ toàn bộ text/evidence để đối chiếu. Trong nội dung đã đọc, vấn đề nổi bật là thiếu thông số và giải thích chưa đủ; chưa thấy thông số số học mới được bịa ra.\n\n## Từng case\n\n| Case | VI | EN | Sản phẩm VI | Sản phẩm EN | Nhận xét |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n\n## Ưu tiên xử lý\n\n1. Hiểu triệu chứng và mục tiêu song ngữ: đục/turbid/cloudy, đất khô/water stress, ghi tự động, truy cập từ xa. Phân biệt đại lượng cần đo với bối cảnh (mưa sau đó nước đục không đồng nghĩa đang tìm cảm biến mưa).\n2. Phân biệt yêu cầu một thiết bị đo nhiều đại lượng với hệ nhiều thiết bị; bộ ghi kết nối các cảm biến không phải tự đo những đại lượng đó.\n3. Ánh xạ mỗi yêu cầu vào chứng cứ cụ thể: liên tục, ngoài trời, bảo trì, bộ nhớ, số kênh, xử lý trung bình/cực đại, tiêu thụ điện. Thiếu chứng cứ thì gọi tên yêu cầu chưa xác nhận.\n4. Xử lý câu hỏi so sánh/lựa chọn thay thế và các câu hỏi cần lịch sử hoặc model cụ thể.\n\n## Tái chạy\n\n\`\`\`powershell\nnode scripts/search/run-vi-en-explanation-cases.mjs\n\`\`\`\n\nresponses.json là dữ liệu thực thu thập từ API. evaluations.json chứa kết quả kiểm tra cấu trúc và nhận xét thủ công cho snapshot này. Script report chứa đánh giá snapshot cố định: khi chạy API lại cần review nội dung mới trước khi tái sinh báo cáo; không dùng danh sách PASS cố định làm oracle regression.\n`;
report += `\n## Đối chiếu dữ liệu và giới hạn LLM\n\nĐã đọc chi tiết 68 sản phẩm qua API products và lưu [catalog-evidence.json](catalog-evidence.json). Đối chiếu 873 evidence với taxonomy, giao thức và đại lượng đo thực tế; 0 evidence không khớp theo phép kiểm tra này. Các alias được chấp nhận có giới hạn: soil moisture → volumetric_water_content, rainfall → precipitation và tên đại lượng song ngữ đã được matcher sử dụng. Đây là kiểm tra fact/evidence, không chứng minh mọi câu suy luận hoặc mức phù hợp với mục tiêu cuối cùng.\n\nKhông response nào có evidence nguồn normalized_spec. Vì vậy các câu hỏi cần số kênh, bộ nhớ, điện năng hoặc độ bền không được giải quyết chỉ bằng việc evidence có mặt.\n\n570 explanation đều source=rule, 0 source=llm. Cấu hình .env ghi LLM_EXPLANATION_ENABLED=true, nhưng điều này chưa xác nhận cấu hình của tiến trình API đang chạy hoặc việc gọi model thành công. Khi kiểm tra sau lượt chạy, ollama ps chỉ có model embedding. Không đủ bằng chứng kết luận nguyên nhân chính xác; kết quả này kiểm tra pipeline search/explanation hiện hoạt động, chưa xác nhận chất lượng diễn đạt bởi LLM.\n\nHai lỗi 400 tái hiện trong TC-WEATHER-007 EN (“without personnel”) và TC-COMM-004 EN (“without visiting”): parser từ chối phủ định về bối cảnh sử dụng, thay vì chỉ phủ định thông số sản phẩm. Đây không phải lỗi kết nối API.\n\nDữ liệu đầy đủ: [responses.json](responses.json), [evaluations.json](evaluations.json).\n`;
await writeFile(`${directory}/report.md`, report);
console.log(JSON.stringify(summary));
