from pathlib import Path
import copy
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]
BASE.joinpath('assets').mkdir(exist_ok=True)
source = ROOT / 'docs/diagrams/reeco-tat-ca-so-do.drawio'
captions = [
    'Bản đồ màn hình client và admin', 'Kiến trúc tổng thể hệ thống',
    'Mô hình dữ liệu catalog và tìm kiếm', 'Mô hình dữ liệu thương mại và tài khoản',
    'Trình tự đăng nhập và bảo vệ API', 'Trình tự tạo đơn và thanh toán VNPay',
    'Trạng thái đơn hàng và thanh toán', 'Use case tổng thể theo actor',
    'Quy trình tìm đặt và xử lý đơn', 'Pipeline xử lý dữ liệu và embedding',
    'Hybrid Search và kiểm chứng kỹ thuật', 'Giải thích có bằng chứng và kiểm chứng LLM',
]
files = ['01-fe-ban-do-man-hinh.drawio','02-be-kien-truc-tong-the.drawio',
    '03-be-erd-du-lieu.drawio','03-be-erd-du-lieu.drawio','04-be-sequence-dang-nhap.drawio',
    '05-be-sequence-don-hang-vnpay.drawio','06-be-trang-thai-don-hang.drawio',
    '07-ba-use-case-tong-the.drawio','08-ba-quy-trinh-nghiep-vu.drawio',
    '09-ai-pipeline-xu-ly-du-lieu.drawio','10-ai-hybrid-search.drawio','11-ai-giai-thich-co-bang-chung.drawio']

# Paper versions keep the original graph structure and use shorter labels and larger type.
overrides = {
  0: {'results':'Kết quả và follow up\nGuidance và evidence',
      'profile':'Hồ sơ và yêu thích\n/account/profile\n/favorites',
      'orders':'Đơn và thông báo\n/account/orders/:id\n/account/notifications',
      'checkout':'Checkout và kết quả\n/orders/:id/success\nVNPay return',
      'adminviews':'Dashboard và báo cáo\nSản phẩm và giá\nĐơn và trạng thái'},
  1: {'api':'NestJS API\nValidation và rate limit\nAuthGuard và AdminGuard',
      'modules':'Module nghiệp vụ\nAuth và Products\nOrders và Notifications',
      'search':'Điều phối tìm kiếm\nRetrieval và technical check\nRerank và explanation',
      'db':'Supabase PostgreSQL\nCatalog và chỉ mục pgvector\nGiá đơn lịch sử thông báo',
      'ollama':'Ollama local\nEmbedding 1536 chiều\nExplanation tùy chọn',
      'bge':'BGE reranker tùy chọn\nTối đa Top 5',
      'vnpay':'VNPay sandbox bên ngoài\nURL thanh toán Return IPN'},
  2: {'products':'products\nPK product_id\nmodel UNIQUE\nname / taxonomy\nstatus active | review',
      'specs':'product_specifications\nPK specification_id\nFK product_id\ncanonical_key / quantity_kind\nnormalized_value / raw_ref',
      'doc':'product_documents\nPK FK product_id\nsearch_document\nsearch_text VI / EN\ncontent_hash',
      'index':'product_search_index\nPK FK product_id\nsearch_text / search_tsv\nembedding vector(1536)\nmodel / dimensions / version\nsource_content_hash / time',
      'media':'product_media\nPK media_id\nFK product_id\nimage_url / product_url\nmedia_type / position',
      'prices':'product_prices\nPK FK product_id\nprice_vnd / updated_at',
      'pricehistory':'product_price_history\nPK id / FK product_id\nold_price / new_price\nFK changed_by nullable\nemail / created_at'},
  3: {'users':'auth.users\nPK id\nemail\napp_metadata role\nuser_metadata profile',
      'products':'products\nPK product_id\nmodel UNIQUE\nstatus',
      'prices':'product_prices\nPK FK product_id\nprice_vnd\nupdated_at',
      'orders':'orders\nPK id / FK customer_id\norder_number / order_code\nstatus / payment_status\npayment_method\nsubtotal / shipping_fee / total\nvnpay_txn_ref / paid_at',
      'items':'order_items\nPK id / FK order_id\nFK product_id\nmodel / product_name snapshot\nunit_price / quantity / line_total',
      'history':'order_status_history\nPK id / FK order_id\nFK changed_by nullable\nfrom_status / to_status\nnote / created_at',
      'notifications':'notifications\nPK id / FK customer_id\nFK order_id nullable\ntype / title / message\nread_at / created_at',
      'pricehistory':'product_price_history\nPK id / FK product_id\nFK changed_by nullable\nold_price_vnd / new_price_vnd\nchanged_by_email / created_at'},
  6: {'FORWARDED_TO_MANUFACTURER':'FORWARDED TO\nMANUFACTURER'},
  8: {'validate':'Kiểm tra user và sản phẩm\nĐọc giá từ DB',
      'checkout':'Đăng nhập và checkout\nĐọc giá mới rồi gửi quote',
      'confirm':'Giá đổi trả 409\nXác nhận lại trước đặt',
      'pay':'COD → PROCESSING\nVNPay → PENDING_PAYMENT',
      'gateway':'Xác minh VNPay verify IPN\nGhi nhận thanh toán',
      'manage':'Admin đổi trạng thái\nLưu lịch sử và thông báo',
      'track':'Xem đơn và thông báo\nBadge polling 30 giây',
      'quote':'Quote khớp?'},
  9: {'raw':'1 Chuẩn bị catalog\nIncoming raw family variant',
      'master':'2 Product master\nIdentity và taxonomy\nActive hoặc review',
      'spec':'3 Chuẩn hóa thông số\nGiá trị đơn vị giao tiếp\nGiữ value_raw và raw_ref',
      'enrich':'4 Enrichment song ngữ\nRule và vocabulary VI EN\nMeasurements capabilities',
      'doc':'5 Search document\nsearch_text VI EN\ncontent_hash SHA256',
      'validate':'6 Validate artifacts\nSchema nguồn đơn vị hash',
      'import':'7 Import Supabase\nTransaction và idempotency\nNguồn đổi xóa vector cũ',
      'backfill':'8 Embedding backfill\nqwen3 embedding 4b\n1536 chiều model version',
      'db':'9 Search index\nFTS vector metadata\nGuard nguồn trước khi ghi',
      'ready':'10 Kiểm tra coverage\nVector current phục vụ API'},
  10: {'request':'POST /search\nValidate query limit context',
       'parse':'Resolve context intent exclusions\nParse model protocol temperature\nChọn retrieval query',
       'keyword':'Keyword retrieval\nFTS literal và model hits',
       'semantic':'Query embedding\nSemantic RPC đúng model version',
       'rrf':'Hợp ứng viên bằng RRF K 60\nHai nguồn chạy song song',
       'technical':'Scope intent exclusions specification\nĐiều kiện kỹ thuật bắt buộc cần MATCH\nLọc và xếp hạng kỹ thuật',
       'rerank':'BGE tùy chọn tối đa Top 5\nBảo vệ identity và tail order\nLỗi giữ thứ tự trước rerank',
       'hydrate':'Hydrate active và giá rồi áp limit\nexplain true tạo giải thích\nTrả kết quả và guidance'},
  11: {'inputs':'Query document specifications\nTechnical match và requirements',
       'rule':'Tạo giải thích theo quy tắc\nText evidence requirements',
       'enabled':'LLM bật và\ncó model?',
       'select':'Tối đa 3 item có evidence\nGiới hạn prompt và wording',
       'call':'Ollama /api/chat\nJSON index và text\nGiữ facts số và phủ định',
       'verify':'JSON index hợp lệ\nverifiedWording đạt?',
       'llm':'Giữ evidence và requirements\nsource llm và accepted',
       'fallback':'Giữ text evidence requirements gốc\nsource rule và status tương ứng'},
}

sections=[]
manifest=[]
for i,page in enumerate(ET.parse(source).findall('diagram')):
    model=copy.deepcopy(page.find('mxGraphModel'))
    graph=model.find('root')
    for cell in list(graph):
        id=cell.get('id')
        style=cell.get('style','')
        if id in ['title','subtitle','footer'] or ('fontSize=13;align=left;spacing=12;' in style):
            graph.remove(cell); continue
        if cell.get('vertex')=='1':
            size=21 if i in [2,3] else 22
            if 'text;' in style: size=20
            style=re.sub(r'fontSize=\d+;', '', style)+f'fontSize={size};'
        elif cell.get('edge')=='1':
            size=23 if i in [4,5] else 19
            style=re.sub(r'fontSize=\d+;', '', style)+f'fontSize={size};'
            if i==8 and cell.get('value')=='Chỉ tiếp tục khi được phép':
                cell.set('value','Được phép')
            if i==11 and cell.get('value')=='Không đạt / invalid_response':
                cell.set('value','Không đạt')
        cell.set('style',style)
        if id in overrides.get(i,{}): cell.set('value',overrides[i][id])
    # Sequence notes were removed; all messages and lifelines stay editable in the source files.
    xml='<mxfile><diagram>'+ET.tostring(model,encoding='unicode')+'</diagram></mxfile>'
    data=html.escape(json.dumps({'xml':xml,'nav':False,'resize':True,'toolbar':'','lightbox':False}),quote=True)
    sections.append(f'<section id="figure{i+1}" style="margin:0 0 30px 0;padding:25px;width:1820px;background:white"><div class="mxgraph" style="max-width:none" data-mxgraph="{data}"></div></section>')
    manifest.append({'number':i+1,'caption':captions[i],'drawio':files[i]})
doc='<!doctype html><meta charset="utf-8"><style>body{margin:0;background:white}section{overflow:visible}</style>'+''.join(sections)+'<script src="viewer-static.min.js"></script>'
BASE.joinpath('figures.html').write_text(doc,encoding='utf-8')
BASE.joinpath('figures.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
viewer=BASE/'viewer-static.min.js'
if not viewer.exists():
    urllib.request.urlretrieve('https://raw.githubusercontent.com/jgraph/drawio/dev/src/main/webapp/js/viewer-static.min.js',viewer)
print('Prepared',len(manifest),'paper diagrams')
