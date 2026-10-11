// Render the scale mark as antialiased PNG icons without dependencies.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function chunk(type,data){const label=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([label,data])));return Buffer.concat([size,label,data,crc]);}
function roundedBoxDistance(x,y,cx,cy,width,height,radius){const dx=Math.abs(x-cx)-width/2+radius,dy=Math.abs(y-cy)-height/2+radius;return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-radius;}
function lineDistance(x,y,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-x1-t*dx,y-y1-t*dy);}
function colorAt(x,y){
  const orange=[255,156,67],gold=[255,210,138];
  if(Math.abs(roundedBoxDistance(x,y,256,256,248,268,42))<=7)return orange;
  if(Math.abs(roundedBoxDistance(x,y,256,205,164,82,18))<=4)return gold;
  for(const line of [[256,179,256,189],[200,188,206,196],[312,188,306,196],[256,226,283,196]])if(lineDistance(x,y,...line)<=4)return gold;
  for(const pad of [190,214,298,322])if(lineDistance(x,y,pad,296,pad,338)<=6)return orange;
  const t=y/512;return [64*(1-t)+22*t,32*(1-t)+16*t,20*(1-t)+13*t];
}
for(const size of [192,512]){
  const rows=Buffer.alloc((size*4+1)*size),samples=4;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const color=[0,0,0];
    for(let sy=0;sy<samples;sy++)for(let sx=0;sx<samples;sx++){const c=colorAt((x+(sx+.5)/samples)*512/size,(y+(sy+.5)/samples)*512/size);for(let channel=0;channel<3;channel++)color[channel]+=c[channel]/(samples*samples);}
    rows.set([...color.map(Math.round),255],y*(size*4+1)+1+x*4);
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  writeFileSync(`public/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));
}
