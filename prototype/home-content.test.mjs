import test from 'node:test';
import assert from 'node:assert/strict';
import {latestPublic,updates} from './dist/home-content.mjs';
test('latest card selects newest public update across all four content types',()=>{for(const type of ['文章','作品','书籍','商品']){const rows=updates.map(x=>({...x,contentUpdatedAt:x.type===type?'2027-01-01T00:00:00Z':x.contentUpdatedAt}));assert.equal(latestPublic(rows).type,type)}});
test('drafts invalid timestamps and empty feeds do not become a latest card',()=>{assert.equal(latestPublic([]),null);assert.equal(latestPublic([{id:'bad',status:'published',contentUpdatedAt:'bad'},{id:'draft',status:'draft',contentUpdatedAt:'2099-01-01'}]),null);assert.equal(latestPublic([...updates,{...updates[0],status:'draft',contentUpdatedAt:'2099-01-01'}]).type,'书籍')});
