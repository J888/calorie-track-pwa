// Generate the app's geometric mark as PNG icons without dependencies.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function chunk(type,data){const label=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([label,data])));return Buffer.concat([size,label,data,crc]);}
for(const size of [192,512]){const rows=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const d=Math.hypot(x-size/2,y-size/2)/size;const color=d<.283&&d>.176?(y<size/2?[102,131,99]:[197,213,180]):[240,244,233];const offset=y*(size*4+1)+1+x*4;rows.set([...color,255],offset);}const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;writeFileSync(`public/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));}
