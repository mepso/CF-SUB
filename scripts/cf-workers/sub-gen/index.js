// 部署完成后在网址后面加上这个，获取订阅器默认节点，/auto

let mytoken= 'auto';//快速订阅访问入口, 留空则不启动快速订阅
let DEFAULT_HOST = '"edgetunnel-2z2.pages.dev"';	//快速订阅域名
let DEFAULT_UUID = '30e9c5c8-ed28-4cd9-b008-dc67277f8b02';//快速订阅UUID
let DEFAULT_PATH = '/?ed=2560';	//快速订阅路径

let subconverter = "api.v1.mk"; //在线订阅转换后端，目前使用肥羊的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subconfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"; //订阅配置文件

let DEFAULT_DOMAIN_URL = 'https://raw.githubusercontent.com/mepso/CF-SUB/main/output/domains.txt';
let DEFAULT_V2RAY_URL = 'https://raw.githubusercontent.com/mepso/CF-SUB/main/output/v2ray.txt';
let DEFAULT_IP_URL = 'https://raw.githubusercontent.com/mepso/CF-SUB/main/output/daily.txt';

// 从在线URL获取优选域名
async function fetchDomains(url) {
	if (!url) {
		return '';
	}
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('无法获取链接');
	}
	return await response.text();
}
let domains;
const domainURL = process.env.DOMAIN_URL || DEFAULT_DOMAIN_URL;
fetchDomains(domainURL).then(fetchedDomains => {
	domains = fetchedDomains;
}).catch(error => {
	console.error('获取优选域名时出错:', error);
});

// 从在线URL获取优选IP
async function fetchIPs(url) {
	if (!url) {
		return '';
	}
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('无法获取链接');
	}
	return await response.text();
}
let ips;
const ipURL = process.env.DAILY_URL || DEFAULT_IP_URL;
fetchIPs(ipURL).then(fetchedIPs => {
	ips = fetchedIPs;
}).catch(error => {
	console.error('获取优选IP时出错:', error);
});

// 从在线URL获取V2ray链接
async function fetchV2rayLink(url) {
	if (!url) {
		return '';
	}
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('无法获取链接');
	}
	return await response.text();
}
let v2rayLink;
const v2rayURL = process.env.V2RAY_URL || DEFAULT_V2RAY_URL;
fetchV2rayLink(v2rayURL).then(fetchedLink => {
	v2rayLink = fetchedLink;
}).catch(error => {
	console.error('获取V2ray链接时出错:', error);
});

let edgetunnel = 'ed';
let RproxyIP = 'false';
let proxyIPs = [
	'proxyip.aliyun.fxxk.dedyn.io',
	'proxyip.multacom.fxxk.dedyn.io',
	'proxyip.vultr.fxxk.dedyn.io',
];
let CMproxyIPs = [
	{ proxyIP: "proxyip.fxxk.dedyn.io", type: "HK" },
];
let proxyhosts = [//本地代理域名池
	//'ppfv2tl9veojd-maillazy.pages.dev',
];
let proxyhostsURL = 'https://raw.githubusercontent.com/cmliu/CFcdnVmess2sub/main/proxyhosts';//在线代理域名池URL
let EndPS = '';//节点名备注内容

let FileName = 'WorkerVless2sub';
let SUBUpdateTime = 6; 
let total = 99;//PB
//let timestamp = now;
let timestamp = 4102329600000;//2099-12-31

// 创建一个新的函数来处理subconverter的响应
async function fetchSubconverterContent(url, UD, total, expire, FileName, SUBUpdateTime) {
    try {
        const subconverterResponse = await fetch(url);
        if (!subconverterResponse.ok) {
            throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
        }
        const subconverterContent = await subconverterResponse.text();
        return new Response(subconverterContent, {
            headers: { 
                "Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(FileName)}; filename=${FileName}`,
                "content-type": "text/plain; charset=utf-8",
                "Profile-Update-Interval": `${SUBUpdateTime}`,
                "Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
            },
        });
    } catch (error) {
        return new Response(`Error: ${error.message}`, {
            status: 500,
            headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
    }
}

// 提取获取参数的逻辑
function getParameters(url, env) {
    let host, uuid, path;
    if (mytoken !== '' && url.pathname.includes(mytoken)) {
        host = env.HOST || DEFAULT_HOST;
        uuid = env.UUID || DEFAULT_UUID;
        path = env.PATH || DEFAULT_PATH;
        edgetunnel = env.ED || edgetunnel;
        RproxyIP = env.RPROXYIP || RproxyIP;
    } else {
        host = url.searchParams.get('host');
        uuid = url.searchParams.get('uuid');
        path = url.searchParams.get('path');
        edgetunnel = url.searchParams.get('edgetunnel') || edgetunnel;
        RproxyIP = url.searchParams.get('proxyip') || RproxyIP;
    }
    return { host, uuid, path };
}

// 提取处理错误响应的逻辑
function handleErrorResponse(url, host, uuid) {
    if (!url.pathname.includes("/sub")) {
        const responseText = `\n路径必须包含 "/sub"\nThe path must contain "/sub"\n\n${url.origin}/sub?host=[your host]&uuid=[your uuid]&path=[your path]`;
        return new Response(responseText, { status: 400, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
    if (!host || !uuid) {
        const responseText = `\n缺少必填参数：host 和 uuid\nMissing required parameters: host and uuid\n\n${url.origin}/sub?host=[your host]&uuid=[your uuid]&path=[your path]`;
        return new Response(responseText, { status: 400, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
}

export default {
	async fetch (request, env) {
		mytoken = env.TOKEN || mytoken;
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const format = url.searchParams.get('format') ? url.searchParams.get('format').toLowerCase() : "null";
		let host, uuid, path;
		let UD = Math.floor(((timestamp - Date.now())/timestamp * 99 * 1099511627776 * 1024)/2);
		total = total * 1099511627776 * 1024;
		let expire= Math.floor(timestamp / 1000) ;

		const { host: h, uuid: u, path: p } = getParameters(url, env);
		host = h;
		uuid = u;
		path = p;
		const errorResponse = handleErrorResponse(url, host, uuid);
		if (errorResponse) return errorResponse;

		if (!path || path.trim() === '') {
			path = DEFAULT_PATH;
		} else {
			path = (path[0] === '/') ? path : '/' + path;
		}

		if (userAgent.includes('clash') || (format === 'clash' && !userAgent.includes('subconverter'))) {
			const subconverterUrl = `https://${subconverter}/sub?target=clash&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;

			return await fetchSubconverterContent(subconverterUrl, UD, total, expire, FileName, SUBUpdateTime);
		} else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || (format === 'singbox' && !userAgent.includes('subconverter'))){
			const subconverterUrl = `https://${subconverter}/sub?target=singbox&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;

			return await fetchSubconverterContent(subconverterUrl, UD, total, expire, FileName, SUBUpdateTime);
		} else {
			if(host.includes('workers.dev') || host.includes('pages.dev')) {
				if (proxyhostsURL) {
					try {
						const response = await fetch(proxyhostsURL); 
					
						if (!response.ok) {
							console.error('获取地址时出错:', response.status, response.statusText);
							return; // 如果有错误，直接返回
						}
					
						const text = await response.text();
						const lines = text.split('\n');
						// 过滤掉空行或只包含空白字符的行
						const nonEmptyLines = lines.filter(line => line.trim() !== '');
					
						proxyhosts = proxyhosts.concat(nonEmptyLines);
					} catch (error) {
						console.error('获取地址时出错:', error);
					}
				}
				// 使用Set对象去重
				proxyhosts = [...new Set(proxyhosts)];
			}
			
			// 使用Set对象去重
			const uniqueAddresses = [...new Set(domains,ips)];
			
			const responseBody = uniqueAddresses.map(address => {
				let port = "443";
				let addressid = address;
			
				if (address.includes(':') && address.includes('#')) {
					const parts = address.split(':');
					address = parts[0];
					const subParts = parts[1].split('#');
					port = subParts[0];
					addressid = subParts[1];
				} else if (address.includes(':')) {
					const parts = address.split(':');
					address = parts[0];
					port = parts[1];
				} else if (address.includes('#')) {
					const parts = address.split('#');
					address = parts[0];
					addressid = parts[1];
				}
			
				if (addressid.includes(':')) {
					addressid = addressid.split(':')[0];
				}
				
				if (edgetunnel.trim() === 'cmliu' && RproxyIP.trim() === 'true') {
					// 将addressid转换为小写
					let lowerAddressid = addressid.toLowerCase();
					// 初始化找到的proxyIP为null
					let foundProxyIP = null;
				
					// 遍历CMproxyIPs数组查找匹配项
					for (let item of CMproxyIPs) {
						if (lowerAddressid.includes(item.type.toLowerCase())) {
							foundProxyIP = item.proxyIP;
							break; // 找到匹配项，跳出循环
						}
					}
				
					if (foundProxyIP) {
						// 如果找到匹配的proxyIP，赋值给path
						path = `/proxyIP=${foundProxyIP}`;
					} else {
						// 如果没有找到匹配项，随机选择一个proxyIP
						const randomProxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];
						path = `/proxyIP=${randomProxyIP}`;
					}
				}

				if (addressid == address) {
					addressid = '优选IP';
				}
				
				let 伪装域名 = host ;
				let 最终路径 = path ;
				let 节点备注 = EndPS ;

				const vlessLink = `vless://${uuid}@${address}:${port}?encryption=none&security=tls&sni=${伪装域名}&fp=random&type=ws&host=${伪装域名}&path=${encodeURIComponent(最终路径)}#${encodeURIComponent(addressid + 节点备注)}`;
			
				return vlessLink;
			}).join('\n');
			
			const combinedContent = v2rayLink + '\n' + responseBody; // 合并内容
			const base64Response = btoa(combinedContent); // 重新进行 Base64 编码


			const response = new Response(base64Response, {
				headers: { 
					//"Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(FileName)}; filename=${FileName}`,
					"content-type": "text/plain; charset=utf-8",
					"Profile-Update-Interval": `${SUBUpdateTime}`,
					"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
				},
			});

			return response;
		}
	}
};