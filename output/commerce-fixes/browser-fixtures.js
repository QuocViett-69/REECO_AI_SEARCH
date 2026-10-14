async (page) => {
 const product = {product_id:'CSI_CS655',model:'CS655',name_en:'Water Content Reflectometer',name_vi:null,category:'Sensors',subcategory:'Soil Sensors',device_type:'Soil Sensor',image_url:null,status:'active',price_vnd:13210000};
 const user = {id:'browser-customer',email:'customer@example.com',full_name:'Test Customer',app_metadata:{role:'customer'}};
 const order = {id:'browser-order',order_number:1001,order_code:'REECO-1001',customer_id:user.id,status:'PROCESSING',payment_method:'cod',payment_status:'COD_PENDING',shipping_method:'standard',shipping_fee:30000,subtotal:13210000,total:13240000,currency:'VND',customer_name:'Test Customer',customer_email:user.email,customer_phone:'0912345678',shipping_address:'Street',city:'City',created_at:'2026-10-14T01:00:00Z',order_items:[{id:1,product_id:product.product_id,model:product.model,product_name:product.name_en,quantity:1,unit_price:13210000,line_total:13210000}],order_status_history:[{id:1,from_status:null,to_status:'PROCESSING',changed_by:'browser-admin',changed_by_label:'admin@example.com',created_at:'2026-10-14T01:00:00Z'}]};
 await page.addInitScript(({user,product})=>{
  localStorage.setItem('reeco_auth_session',JSON.stringify({user,access_token:'browser-fixture-token',expires_at:4102444800}));
  localStorage.setItem('reeco_admin_session',JSON.stringify({user:{id:'browser-admin',email:'admin@example.com',app_metadata:{role:'admin'}},access_token:'browser-fixture-token',expires_at:4102444800}));
  if(!localStorage.getItem('qa_price'))localStorage.setItem('qa_price',String(product.price_vnd));
 },{user,product});
 await page.route('**/api/v1/**',async route=>{
  const url=new URL(route.request().url()),path=url.pathname.replace(/^.*\/api\/v1/,'');
  const price=await page.evaluate(()=>Number(localStorage.getItem('qa_price')||13210000));
  const p={...product,price_vnd:price};
  let data,status=200;
  if(route.request().method()==='OPTIONS')data={};
  else if(path==='/products'||path==='/admin/products')data={items:[p],pagination:{page:1,limit:100,total:1,total_pages:1}};
  else if(path==='/products/CSI_CS655'||path==='/products/CS655'||path==='/admin/products/CSI_CS655')data={product:p,taxonomy:null,measurements:[],applications:[],capabilities:[],supported_protocols:['SDI-12','RS-232'],unsupported_protocols:[],specifications:[],important_specifications:[],aliases:[],variants:[],media:[],price_vnd:price,price_history:[{id:1,old_price_vnd:13210000,new_price_vnd:14210000,changed_by:'browser-admin',changed_by_email:'admin@example.com',created_at:'2026-10-14T02:00:00Z'}]};
  else if(path==='/orders/browser-order'||path==='/admin/orders/browser-order')data=order;
  else if(path==='/orders/me'||path==='/admin/orders')data={items:[order],total:1,page:1,page_size:20};
  else if(path.includes('notifications'))data={items:[],unread_count:0,total:0};
  else if(path==='/auth/me')data=user;
  else if(path==='/admin/orders/stats')data={};
  else {status=404;data={message:'Browser fixture: not available'};}
  await route.fulfill({status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,PUT,OPTIONS'},body:JSON.stringify(data)});
 });
 await page.goto('http://127.0.0.1:4391/products');
}
