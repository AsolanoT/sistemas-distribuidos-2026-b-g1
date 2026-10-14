    // Interrupt a real in-flight Sales request after durable stock reservation.
    // Docker pause is a transport interruption, with no substitute participant.
    sql(`UPDATE products_schema.product SET price_cents=125 WHERE product_id='${product}'`);
    const salesContainer=owner+'-sales';
    docker(['pause',salesContainer]);
    let pending;
    try {
        pending=await request('workflow','/api/v1/sagas/register-sale','POST',{customerId:second.body.customerId,lines:[{productId:product,quantity:1}]},'infra-recovery-'+randomUUID(),human);
        assert.equal(pending.status,201);
        await wait(()=>sql(`SELECT count(*) FROM products_schema.stock_reservation WHERE reservation_id=(SELECT resource_id FROM products_schema.idempotency_key WHERE idempotency_key='${pending.body.sagaId}:reserve-stock')`)==='1',10);
        docker(['kill','--signal','KILL',wf]);
    } finally { docker(['unpause',salesContainer],{allowFailure:true}); }
    docker(['start',wf]);bind('workflow',wf);await wait(async()=> (await request('workflow','/health')).status===200);
    const recovered=await wait(async()=>{const r=await request('workflow',pending.location,'GET',undefined,undefined,human);return r.body.status==='COMPLETED'?r.body:false;},90);
    assert.ok(recovered.saleId);assert.equal(saleCount(),2);
    assert.equal(sql(`SELECT stock FROM products_schema.product WHERE product_id='${product}'`),'17');
    assert.equal(sql(`SELECT count(*) FROM products_schema.stock_reservation WHERE reservation_id=(SELECT resource_id FROM products_schema.idempotency_key WHERE idempotency_key='${pending.body.sagaId}:reserve-stock')`),'1');
    effects.recovery={stock:17,sales:2,reservationsForRecoveredSaga:1};
    console.log('PASS real in-flight crash recovery: one reservation and one additional sale');

    // Actual public Auth endpoint through the shipped Gateway and Host proxy.
    const gatewayImage=build('gateway',resolve(root,'../synkro-api-gateway'));
    launch('synkro-api-gateway',gatewayImage,{CORS_ALLOWED_ORIGINS:'http://localhost:5173',RATE_LIMIT_PER_SECOND:'100'});
    const authPortalImage=build('auth-portal',resolve(root,'../synkro-auth-portal'));
    launch('synkro-auth-portal',authPortalImage);
    const hostImage=build('host',resolve(root,'../synkro-front'));
    const host=launch('host',hostImage,{},['--publish','127.0.0.1::80']);
    const hostPort=JSON.parse(docker(['inspect',host]).stdout)[0].NetworkSettings.Ports['80/tcp'][0].HostPort;
    const origin='http://127.0.0.1:'+hostPort;
    await wait(async()=> (await fetch(origin+'/login')).status===200);
    const entry=await fetch(origin+'/remotes/auth/assets/remoteEntry.js');
    assert.equal(entry.status,200);assert.match(entry.headers.get('Content-Type'),/javascript/);
    assert.match(entry.headers.get('Cache-Control'),/no-store/);
    const proxied=await fetch(origin+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'joint-admin@example.test',password:passwords.human})});
    assert.equal(proxied.status,200);const pair=await proxied.json();assert.ok(pair.accessToken&&pair.refreshToken);
    secrets.push(pair.accessToken,pair.refreshToken);
    const wrong=await fetch(origin+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'joint-admin@example.test',password:'invalid-disposable-password'})});
    assert.equal(wrong.status,401);
    effects.publicLogin={route:'/login',authAssets:'internal-80',gatewayLogin:200,wrongPassword:401};
    console.log('PASS real public login route, Auth remote delivery, Host to Gateway to actual Auth, wrong-password rejection');
