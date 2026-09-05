(function() {
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	//#region src/components/MolstarScripts/index.py?raw
	var MolstarScripts_exports = /* @__PURE__ */ __exportAll({ default: () => MolstarScripts_default });
	var MolstarScripts_default = "import time\nimport numpy as np\nimport tmtools\n\ndef tmtools_align(coords1, coords2, seq1, seq2):\n    x1, y1, z1 = np.array(coords1.x), np.array(coords1.y), np.array(coords1.z)\n    x2, y2, z2 = np.array(coords2.x), np.array(coords2.y), np.array(coords2.z)\n\n    coords1 = np.column_stack([x1, y1, z1])\n    coords2 = np.column_stack([x2, y2, z2])\n    print('A', time.time())\n    tma = tmtools.tm_align(coords1, coords2, seq1, seq2)\n    print('B', time.time())\n\n    return {\n        'rmsd': tma.rmsd,\n        'u': tma.u,\n        't': tma.t,\n    }\n";
	//#endregion
	//#region src/components/PythonTerminal/index.py?raw
	var PythonTerminal_exports = /* @__PURE__ */ __exportAll({ default: () => PythonTerminal_default });
	var PythonTerminal_default = "import builtins\nimport typing\nfrom collections import namedtuple\n\n#\n# Kind detection for auto-completion\n#\n\nToken = namedtuple('Token', 'name kind')\n\nclass Kind:\n    TYPE = 'Type'\n    CALLABLE = 'Callable'\n    OBJECT = 'Object'\n\ndef detect_kind(obj):\n    if isinstance(obj, type):\n        return Kind.TYPE\n    if isinstance(obj, typing.Callable):\n        return Kind.CALLABLE\n    return Kind.OBJECT\n\ndef introspect_members(obj):\n    return [\n        Token(m, detect_kind(m))\n        for m in dir(obj)\n        if not m.startswith('_')\n    ]\n\ndef introspect_globals(exclude_errors=True):\n    globals_ = globals().keys()\n    builtins_ = (b for b in dir(builtins))\n    vars = (*globals_, *builtins_)\n    vars = (v for v in vars if not v.startswith('_'))\n    if exclude_errors:\n        vars = (v for v in vars if 'Errors' not in v and 'Exception' not in v)\n    return [Token(v, detect_kind(v)) for v in vars]\n";
	//#endregion
	//#region node_modules/comlink/dist/esm/comlink.mjs
	/**
	* @license
	* Copyright 2019 Google LLC
	* SPDX-License-Identifier: Apache-2.0
	*/
	const proxyMarker = Symbol("Comlink.proxy");
	const createEndpoint = Symbol("Comlink.endpoint");
	const releaseProxy = Symbol("Comlink.releaseProxy");
	const finalizer = Symbol("Comlink.finalizer");
	const throwMarker = Symbol("Comlink.thrown");
	const isObject = (val) => typeof val === "object" && val !== null || typeof val === "function";
	/**
	* Allows customizing the serialization of certain values.
	*/
	const transferHandlers = /* @__PURE__ */ new Map([["proxy", {
		canHandle: (val) => isObject(val) && val[proxyMarker],
		serialize(obj) {
			const { port1, port2 } = new MessageChannel();
			expose(obj, port1);
			return [port2, [port2]];
		},
		deserialize(port) {
			port.start();
			return wrap(port);
		}
	}], ["throw", {
		canHandle: (value) => isObject(value) && throwMarker in value,
		serialize({ value }) {
			let serialized;
			if (value instanceof Error) serialized = {
				isError: true,
				value: {
					message: value.message,
					name: value.name,
					stack: value.stack
				}
			};
			else serialized = {
				isError: false,
				value
			};
			return [serialized, []];
		},
		deserialize(serialized) {
			if (serialized.isError) throw Object.assign(new Error(serialized.value.message), serialized.value);
			throw serialized.value;
		}
	}]]);
	function isAllowedOrigin(allowedOrigins, origin) {
		for (const allowedOrigin of allowedOrigins) {
			if (origin === allowedOrigin || allowedOrigin === "*") return true;
			if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) return true;
		}
		return false;
	}
	function expose(obj, ep = globalThis, allowedOrigins = ["*"]) {
		ep.addEventListener("message", function callback(ev) {
			if (!ev || !ev.data) return;
			if (!isAllowedOrigin(allowedOrigins, ev.origin)) {
				console.warn(`Invalid origin '${ev.origin}' for comlink proxy`);
				return;
			}
			const { id, type, path } = Object.assign({ path: [] }, ev.data);
			const argumentList = (ev.data.argumentList || []).map(fromWireValue);
			let returnValue;
			try {
				const parent = path.slice(0, -1).reduce((obj, prop) => obj[prop], obj);
				const rawValue = path.reduce((obj, prop) => obj[prop], obj);
				switch (type) {
					case "GET":
						returnValue = rawValue;
						break;
					case "SET":
						parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
						returnValue = true;
						break;
					case "APPLY":
						returnValue = rawValue.apply(parent, argumentList);
						break;
					case "CONSTRUCT":
						returnValue = proxy(new rawValue(...argumentList));
						break;
					case "ENDPOINT":
						{
							const { port1, port2 } = new MessageChannel();
							expose(obj, port2);
							returnValue = transfer(port1, [port1]);
						}
						break;
					case "RELEASE":
						returnValue = void 0;
						break;
					default: return;
				}
			} catch (value) {
				returnValue = {
					value,
					[throwMarker]: 0
				};
			}
			Promise.resolve(returnValue).catch((value) => {
				return {
					value,
					[throwMarker]: 0
				};
			}).then((returnValue) => {
				const [wireValue, transferables] = toWireValue(returnValue);
				ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
				if (type === "RELEASE") {
					ep.removeEventListener("message", callback);
					closeEndPoint(ep);
					if (finalizer in obj && typeof obj[finalizer] === "function") obj[finalizer]();
				}
			}).catch((error) => {
				const [wireValue, transferables] = toWireValue({
					value: /* @__PURE__ */ new TypeError("Unserializable return value"),
					[throwMarker]: 0
				});
				ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
			});
		});
		if (ep.start) ep.start();
	}
	function isMessagePort(endpoint) {
		return endpoint.constructor.name === "MessagePort";
	}
	function closeEndPoint(endpoint) {
		if (isMessagePort(endpoint)) endpoint.close();
	}
	function wrap(ep, target) {
		const pendingListeners = /* @__PURE__ */ new Map();
		ep.addEventListener("message", function handleMessage(ev) {
			const { data } = ev;
			if (!data || !data.id) return;
			const resolver = pendingListeners.get(data.id);
			if (!resolver) return;
			try {
				resolver(data);
			} finally {
				pendingListeners.delete(data.id);
			}
		});
		return createProxy(ep, pendingListeners, [], target);
	}
	function throwIfProxyReleased(isReleased) {
		if (isReleased) throw new Error("Proxy has been released and is not useable");
	}
	function releaseEndpoint(ep) {
		return requestResponseMessage(ep, /* @__PURE__ */ new Map(), { type: "RELEASE" }).then(() => {
			closeEndPoint(ep);
		});
	}
	const proxyCounter = /* @__PURE__ */ new WeakMap();
	const proxyFinalizers = "FinalizationRegistry" in globalThis && new FinalizationRegistry((ep) => {
		const newCount = (proxyCounter.get(ep) || 0) - 1;
		proxyCounter.set(ep, newCount);
		if (newCount === 0) releaseEndpoint(ep);
	});
	function registerProxy(proxy, ep) {
		const newCount = (proxyCounter.get(ep) || 0) + 1;
		proxyCounter.set(ep, newCount);
		if (proxyFinalizers) proxyFinalizers.register(proxy, ep, proxy);
	}
	function unregisterProxy(proxy) {
		if (proxyFinalizers) proxyFinalizers.unregister(proxy);
	}
	function createProxy(ep, pendingListeners, path = [], target = function() {}) {
		let isProxyReleased = false;
		const proxy = new Proxy(target, {
			get(_target, prop) {
				throwIfProxyReleased(isProxyReleased);
				if (prop === releaseProxy) return () => {
					unregisterProxy(proxy);
					releaseEndpoint(ep);
					pendingListeners.clear();
					isProxyReleased = true;
				};
				if (prop === "then") {
					if (path.length === 0) return { then: () => proxy };
					const r = requestResponseMessage(ep, pendingListeners, {
						type: "GET",
						path: path.map((p) => p.toString())
					}).then(fromWireValue);
					return r.then.bind(r);
				}
				return createProxy(ep, pendingListeners, [...path, prop]);
			},
			set(_target, prop, rawValue) {
				throwIfProxyReleased(isProxyReleased);
				const [value, transferables] = toWireValue(rawValue);
				return requestResponseMessage(ep, pendingListeners, {
					type: "SET",
					path: [...path, prop].map((p) => p.toString()),
					value
				}, transferables).then(fromWireValue);
			},
			apply(_target, _thisArg, rawArgumentList) {
				throwIfProxyReleased(isProxyReleased);
				const last = path[path.length - 1];
				if (last === createEndpoint) return requestResponseMessage(ep, pendingListeners, { type: "ENDPOINT" }).then(fromWireValue);
				if (last === "bind") return createProxy(ep, pendingListeners, path.slice(0, -1));
				const [argumentList, transferables] = processArguments(rawArgumentList);
				return requestResponseMessage(ep, pendingListeners, {
					type: "APPLY",
					path: path.map((p) => p.toString()),
					argumentList
				}, transferables).then(fromWireValue);
			},
			construct(_target, rawArgumentList) {
				throwIfProxyReleased(isProxyReleased);
				const [argumentList, transferables] = processArguments(rawArgumentList);
				return requestResponseMessage(ep, pendingListeners, {
					type: "CONSTRUCT",
					path: path.map((p) => p.toString()),
					argumentList
				}, transferables).then(fromWireValue);
			}
		});
		registerProxy(proxy, ep);
		return proxy;
	}
	function myFlat(arr) {
		return Array.prototype.concat.apply([], arr);
	}
	function processArguments(argumentList) {
		const processed = argumentList.map(toWireValue);
		return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
	}
	const transferCache = /* @__PURE__ */ new WeakMap();
	function transfer(obj, transfers) {
		transferCache.set(obj, transfers);
		return obj;
	}
	function proxy(obj) {
		return Object.assign(obj, { [proxyMarker]: true });
	}
	function toWireValue(value) {
		for (const [name, handler] of transferHandlers) if (handler.canHandle(value)) {
			const [serializedValue, transferables] = handler.serialize(value);
			return [{
				type: "HANDLER",
				name,
				value: serializedValue
			}, transferables];
		}
		return [{
			type: "RAW",
			value
		}, transferCache.get(value) || []];
	}
	function fromWireValue(value) {
		switch (value.type) {
			case "HANDLER": return transferHandlers.get(value.name).deserialize(value.value);
			case "RAW": return value.value;
		}
	}
	function requestResponseMessage(ep, pendingListeners, msg, transfers) {
		return new Promise((resolve) => {
			const id = generateUUID();
			pendingListeners.set(id, resolve);
			if (ep.start) ep.start();
			ep.postMessage(Object.assign({ id }, msg), transfers);
		});
	}
	function generateUUID() {
		return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
	}
	//#endregion
	//#region __vite-browser-external
	var require___vite_browser_external = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = {};
	}));
	//#endregion
	//#region node_modules/pyodide/pyodide.mjs
	var Q = Object.defineProperty;
	var o = (e, t) => Q(e, "name", {
		value: t,
		configurable: !0
	});
	var R = ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (t, n) => (typeof require < "u" ? require : t)[n] }) : e)(function(e) {
		if (typeof require < "u") return require.apply(this, arguments);
		throw Error("Dynamic require of \"" + e + "\" is not supported");
	});
	var W = (() => {
		for (var e = /* @__PURE__ */ new Uint8Array(128), t = 0; t < 64; t++) e[t < 26 ? t + 65 : t < 52 ? t + 71 : t < 62 ? t - 4 : t * 4 - 205] = t;
		return (n) => {
			for (var i = n.length, s = new Uint8Array((i - (n[i - 1] == "=") - (n[i - 2] == "=")) * 3 / 4 | 0), r = 0, a = 0; r < i;) {
				var c = e[n.charCodeAt(r++)], l = e[n.charCodeAt(r++)], d = e[n.charCodeAt(r++)], u = e[n.charCodeAt(r++)];
				s[a++] = c << 2 | l >> 4, s[a++] = l << 4 | d >> 2, s[a++] = d << 6 | u;
			}
			return s;
		};
	})();
	function Z(e) {
		return !isNaN(parseFloat(e)) && isFinite(e);
	}
	o(Z, "_isNumber");
	function P(e) {
		return e.charAt(0).toUpperCase() + e.substring(1);
	}
	o(P, "_capitalize");
	function D(e) {
		return function() {
			return this[e];
		};
	}
	o(D, "_getter");
	var N = [
		"isConstructor",
		"isEval",
		"isNative",
		"isToplevel"
	];
	var I = ["columnNumber", "lineNumber"];
	var S = [
		"fileName",
		"functionName",
		"source"
	];
	var F = N.concat(I, S, ["args"], ["evalOrigin"]);
	function p(e) {
		if (e) for (var t = 0; t < F.length; t++) e[F[t]] !== void 0 && this["set" + P(F[t])](e[F[t]]);
	}
	o(p, "StackFrame");
	p.prototype = {
		getArgs: o(function() {
			return this.args;
		}, "getArgs"),
		setArgs: o(function(e) {
			if (Object.prototype.toString.call(e) !== "[object Array]") throw new TypeError("Args must be an Array");
			this.args = e;
		}, "setArgs"),
		getEvalOrigin: o(function() {
			return this.evalOrigin;
		}, "getEvalOrigin"),
		setEvalOrigin: o(function(e) {
			if (e instanceof p) this.evalOrigin = e;
			else if (e instanceof Object) this.evalOrigin = new p(e);
			else throw new TypeError("Eval Origin must be an Object or StackFrame");
		}, "setEvalOrigin"),
		toString: o(function() {
			var e = this.getFileName() || "", t = this.getLineNumber() || "", n = this.getColumnNumber() || "", i = this.getFunctionName() || "";
			return this.getIsEval() ? e ? "[eval] (" + e + ":" + t + ":" + n + ")" : "[eval]:" + t + ":" + n : i ? i + " (" + e + ":" + t + ":" + n + ")" : e + ":" + t + ":" + n;
		}, "toString")
	};
	p.fromString = o(function(t) {
		var n = t.indexOf("("), i = t.lastIndexOf(")"), s = t.substring(0, n), r = t.substring(n + 1, i).split(","), a = t.substring(i + 1);
		if (a.indexOf("@") === 0) var c = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(a, ""), l = c[1], d = c[2], u = c[3];
		return new p({
			functionName: s,
			args: r || void 0,
			fileName: l,
			lineNumber: d || void 0,
			columnNumber: u || void 0
		});
	}, "StackFrame$$fromString");
	for (v = 0; v < N.length; v++) p.prototype["get" + P(N[v])] = D(N[v]), p.prototype["set" + P(N[v])] = function(e) {
		return function(t) {
			this[e] = !!t;
		};
	}(N[v]);
	var v;
	for (b = 0; b < I.length; b++) p.prototype["get" + P(I[b])] = D(I[b]), p.prototype["set" + P(I[b])] = function(e) {
		return function(t) {
			if (!Z(t)) throw new TypeError(e + " must be a Number");
			this[e] = Number(t);
		};
	}(I[b]);
	var b;
	for (E = 0; E < S.length; E++) p.prototype["get" + P(S[E])] = D(S[E]), p.prototype["set" + P(S[E])] = function(e) {
		return function(t) {
			this[e] = String(t);
		};
	}(S[E]);
	var E;
	var A = p;
	function ne() {
		var e = /^\s*at .*(\S+:\d+|\(native\))/m, t = /^(eval@)?(\[native code])?$/;
		return {
			parse: o(function(i) {
				if (i.stack && i.stack.match(e)) return this.parseV8OrIE(i);
				if (i.stack) return this.parseFFOrSafari(i);
				throw new Error("Cannot parse given Error object");
			}, "ErrorStackParser$$parse"),
			extractLocation: o(function(i) {
				if (i.indexOf(":") === -1) return [i];
				var r = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(i.replace(/[()]/g, ""));
				return [
					r[1],
					r[2] || void 0,
					r[3] || void 0
				];
			}, "ErrorStackParser$$extractLocation"),
			parseV8OrIE: o(function(i) {
				return i.stack.split(`
`).filter(function(r) {
					return !!r.match(e);
				}, this).map(function(r) {
					r.indexOf("(eval ") > -1 && (r = r.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, ""));
					var a = r.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, ""), c = a.match(/ (\(.+\)$)/);
					a = c ? a.replace(c[0], "") : a;
					var l = this.extractLocation(c ? c[1] : a);
					return new A({
						functionName: c && a || void 0,
						fileName: ["eval", "<anonymous>"].indexOf(l[0]) > -1 ? void 0 : l[0],
						lineNumber: l[1],
						columnNumber: l[2],
						source: r
					});
				}, this);
			}, "ErrorStackParser$$parseV8OrIE"),
			parseFFOrSafari: o(function(i) {
				return i.stack.split(`
`).filter(function(r) {
					return !r.match(t);
				}, this).map(function(r) {
					if (r.indexOf(" > eval") > -1 && (r = r.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1")), r.indexOf("@") === -1 && r.indexOf(":") === -1) return new A({ functionName: r });
					var a = /((.*".+"[^@]*)?[^@]*)(?:@)/, c = r.match(a), l = c && c[1] ? c[1] : void 0, d = this.extractLocation(r.replace(a, ""));
					return new A({
						functionName: l,
						fileName: d[0],
						lineNumber: d[1],
						columnNumber: d[2],
						source: r
					});
				}, this);
			}, "ErrorStackParser$$parseFFOrSafari")
		};
	}
	o(ne, "ErrorStackParser");
	var M = new ne();
	function ie() {
		if (typeof API < "u" && API !== globalThis.API) return API.runtimeEnv;
		return oe({
			IN_BUN: typeof Bun < "u",
			IN_DENO: typeof Deno < "u",
			IN_NODE: typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && !process.browser,
			IN_SAFARI: typeof navigator == "object" && typeof navigator.userAgent == "string" && navigator.userAgent.indexOf("Chrome") === -1 && navigator.userAgent.indexOf("Safari") > -1,
			IN_SHELL: typeof read == "function" && typeof load == "function",
			IN_WORKERD: typeof navigator == "object" && navigator.userAgent?.includes("Cloudflare-Workers")
		});
	}
	o(ie, "getGlobalRuntimeEnv");
	var f = ie();
	function oe(e) {
		let t = e.IN_NODE && typeof module < "u" && module.exports && typeof R == "function" && typeof __dirname == "string", n = e.IN_NODE && !t, i = !e.IN_NODE && !e.IN_DENO && !e.IN_BUN, s = i && typeof window < "u" && typeof window.document < "u" && typeof document.createElement == "function" && "sessionStorage" in window && typeof globalThis.importScripts != "function", r = i && typeof globalThis.WorkerGlobalScope < "u" && typeof globalThis.self < "u" && globalThis.self instanceof globalThis.WorkerGlobalScope;
		if (r && ae()) throw new Error("Classic web workers are not supported");
		let a = {
			...e,
			IN_BROWSER: i,
			IN_BROWSER_MAIN_THREAD: s,
			IN_BROWSER_WEB_WORKER: r,
			IN_NODE_COMMONJS: t,
			IN_NODE_ESM: n
		};
		if (!(a.IN_BROWSER_MAIN_THREAD || a.IN_BROWSER_WEB_WORKER || a.IN_NODE || a.IN_SHELL || a.IN_WORKERD)) throw new Error(`Cannot determine runtime environment: ${JSON.stringify(a)}`);
		return a;
	}
	o(oe, "calculateDerivedFlags");
	function ae() {
		try {
			return globalThis.importScripts("data:text/javascript,"), !0;
		} catch {
			return !1;
		}
	}
	o(ae, "isClassicWorker");
	var $;
	var x;
	var B;
	var L;
	async function C() {
		if (!f.IN_NODE || ($ = (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1))).default, B = await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1)), L = await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1)), (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1))).default, x = await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1)), T = x.sep, typeof R < "u")) return;
		let s = {
			fs: B,
			crypto: await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1)),
			ws: await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1)),
			child_process: await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1))
		};
		globalThis.require = function(r) {
			return s[r];
		};
	}
	o(C, "initNodeModules");
	function le(e, t) {
		return x.resolve(t || ".", e);
	}
	o(le, "node_resolvePath");
	function ce(e, t) {
		return t === void 0 && (t = location), new URL(e, t).toString();
	}
	o(ce, "browser_resolvePath");
	var w;
	f.IN_NODE ? w = le : f.IN_SHELL ? w = o((e) => e, "resolvePath") : w = ce;
	var T;
	f.IN_NODE || (T = "/");
	function de(e, t) {
		return e.startsWith("file://") && (e = e.slice(7)), e.includes("://") ? { response: fetch(e) } : { binary: L.readFile(e).then((n) => new Uint8Array(n.buffer, n.byteOffset, n.byteLength)) };
	}
	o(de, "node_getBinaryResponse");
	function ue(e, t) {
		if (e.startsWith("file://") && (e = e.slice(7)), e.includes("://")) throw new Error("Shell cannot fetch urls");
		return { binary: Promise.resolve(new Uint8Array(readbuffer(e))) };
	}
	o(ue, "shell_getBinaryResponse");
	function fe(e, t) {
		let n = new URL(e, location);
		return { response: fetch(n, t ? { integrity: t } : {}) };
	}
	o(fe, "browser_getBinaryResponse");
	var _;
	f.IN_NODE ? _ = de : f.IN_SHELL ? _ = ue : _ = fe;
	async function j(e, t) {
		let { response: n, binary: i } = _(e, t);
		if (i) return i;
		let s = await n;
		if (!s.ok) throw new Error(`Failed to load '${e}': request failed.`);
		return new Uint8Array(await s.arrayBuffer());
	}
	o(j, "loadBinaryFile");
	var O;
	f.IN_NODE ? O = me : O = o(async (e) => await import(e), "loadScript");
	async function me(e) {
		return e.startsWith("file://") && (e = e.slice(7)), e.includes("://") ? await import(e) : await import($.pathToFileURL(e).href);
	}
	o(me, "nodeLoadScript");
	async function H(e) {
		if (f.IN_NODE) {
			await C();
			let t = await L.readFile(e, { encoding: "utf8" });
			return JSON.parse(t);
		} else if (f.IN_SHELL) {
			let t = read(e);
			return JSON.parse(t);
		} else return await (await fetch(e)).json();
	}
	o(H, "loadLockFile");
	async function J() {
		if (f.IN_NODE_COMMONJS) return __dirname;
		let e;
		try {
			throw new Error();
		} catch (i) {
			e = i;
		}
		let t = M.parse(e)[0].fileName;
		if (f.IN_NODE && !t.startsWith("file://") && (t = `file://${t}`), f.IN_NODE_ESM) {
			let i = await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1));
			return (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require___vite_browser_external(), 1))).fileURLToPath(i.dirname(t));
		}
		let n = t.lastIndexOf(T);
		if (n === -1) throw new Error("Could not extract indexURL path from pyodide module location. Please pass the indexURL explicitly to loadPyodide.");
		return t.slice(0, n);
	}
	o(J, "calculateDirname");
	function V(e) {
		return e.substring(0, e.lastIndexOf("/") + 1) || globalThis.location?.toString() || ".";
	}
	o(V, "calculateInstallBaseUrl");
	function z(e) {
		let t = e.FS, n = e.FS.filesystems.MEMFS, i = e.PATH, s = {
			DIR_MODE: 16895,
			FILE_MODE: 33279,
			mount: o(function(r) {
				if (!r.opts.fileSystemHandle) throw new Error("opts.fileSystemHandle is required");
				return n.mount.apply(null, arguments);
			}, "mount"),
			syncfs: o(async (r, a, c) => {
				try {
					let l = s.getLocalSet(r), d = await s.getRemoteSet(r), u = a ? d : l, y = a ? l : d;
					await s.reconcile(r, u, y), c(null);
				} catch (l) {
					c(l);
				}
			}, "syncfs"),
			getLocalSet: o((r) => {
				let a = Object.create(null);
				function c(u) {
					return u !== "." && u !== "..";
				}
				o(c, "isRealDir");
				function l(u) {
					return (y) => i.join2(u, y);
				}
				o(l, "toAbsolute");
				let d = t.readdir(r.mountpoint).filter(c).map(l(r.mountpoint));
				for (; d.length;) {
					let u = d.pop(), y = t.stat(u);
					t.isDir(y.mode) && d.push.apply(d, t.readdir(u).filter(c).map(l(u))), a[u] = {
						timestamp: y.mtime,
						mode: y.mode
					};
				}
				return {
					type: "local",
					entries: a
				};
			}, "getLocalSet"),
			getRemoteSet: o(async (r) => {
				let a = Object.create(null), c = await pe(r.opts.fileSystemHandle);
				for (let [l, d] of c) l !== "." && (a[i.join2(r.mountpoint, l)] = {
					timestamp: d.kind === "file" ? new Date((await d.getFile()).lastModified) : /* @__PURE__ */ new Date(),
					mode: d.kind === "file" ? s.FILE_MODE : s.DIR_MODE
				});
				return {
					type: "remote",
					entries: a,
					handles: c
				};
			}, "getRemoteSet"),
			loadLocalEntry: o((r) => {
				let c = t.lookupPath(r, {}).node, l = t.stat(r);
				if (t.isDir(l.mode)) return {
					timestamp: l.mtime,
					mode: l.mode
				};
				if (t.isFile(l.mode)) return c.contents = n.getFileDataAsTypedArray(c), {
					timestamp: l.mtime,
					mode: l.mode,
					contents: c.contents
				};
				throw new Error("node type not supported");
			}, "loadLocalEntry"),
			storeLocalEntry: o((r, a) => {
				if (t.isDir(a.mode)) t.mkdirTree(r, a.mode);
				else if (t.isFile(a.mode)) t.writeFile(r, a.contents, { canOwn: !0 });
				else throw new Error("node type not supported");
				t.chmod(r, a.mode), t.utime(r, a.timestamp, a.timestamp);
			}, "storeLocalEntry"),
			removeLocalEntry: o((r) => {
				var a = t.stat(r);
				t.isDir(a.mode) ? t.rmdir(r) : t.isFile(a.mode) && t.unlink(r);
			}, "removeLocalEntry"),
			loadRemoteEntry: o(async (r) => {
				if (r.kind === "file") {
					let a = await r.getFile();
					return {
						contents: new Uint8Array(await a.arrayBuffer()),
						mode: s.FILE_MODE,
						timestamp: new Date(a.lastModified)
					};
				} else {
					if (r.kind === "directory") return {
						mode: s.DIR_MODE,
						timestamp: /* @__PURE__ */ new Date()
					};
					throw new Error("unknown kind: " + r.kind);
				}
			}, "loadRemoteEntry"),
			storeRemoteEntry: o(async (r, a, c) => {
				let l = r.get(i.dirname(a)), d = t.isFile(c.mode) ? await l.getFileHandle(i.basename(a), { create: !0 }) : await l.getDirectoryHandle(i.basename(a), { create: !0 });
				if (d.kind === "file") {
					let u = await d.createWritable();
					await u.write(c.contents), await u.close();
				}
				r.set(a, d);
			}, "storeRemoteEntry"),
			removeRemoteEntry: o(async (r, a) => {
				await r.get(i.dirname(a)).removeEntry(i.basename(a)), r.delete(a);
			}, "removeRemoteEntry"),
			reconcile: o(async (r, a, c) => {
				let l = 0, d = [];
				Object.keys(a.entries).forEach(function(m) {
					let g = a.entries[m], h = c.entries[m];
					(!h || t.isFile(g.mode) && g.timestamp.getTime() > h.timestamp.getTime()) && (d.push(m), l++);
				}), d.sort();
				let u = [];
				if (Object.keys(c.entries).forEach(function(m) {
					a.entries[m] || (u.push(m), l++);
				}), u.sort().reverse(), !l) return;
				let y = a.type === "remote" ? a.handles : c.handles;
				for (let m of d) {
					let g = i.normalize(m.replace(r.mountpoint, "/")).substring(1);
					if (c.type === "local") {
						let h = y.get(g), X = await s.loadRemoteEntry(h);
						s.storeLocalEntry(m, X);
					} else {
						let h = s.loadLocalEntry(m);
						await s.storeRemoteEntry(y, g, h);
					}
				}
				for (let m of u) if (c.type === "local") s.removeLocalEntry(m);
				else {
					let g = i.normalize(m.replace(r.mountpoint, "/")).substring(1);
					await s.removeRemoteEntry(y, g);
				}
			}, "reconcile")
		};
		e.FS.filesystems.NATIVEFS_ASYNC = s;
	}
	o(z, "initializeNativeFS");
	var pe = o(async (e) => {
		let t = [];
		async function n(s) {
			for await (let r of s.values()) t.push(r), r.kind === "directory" && await n(r);
		}
		o(n, "collect"), await n(e);
		let i = /* @__PURE__ */ new Map();
		i.set(".", e);
		for (let s of t) {
			let r = (await e.resolve(s)).join("/");
			i.set(r, s);
		}
		return i;
	}, "getFsHandles");
	var G = W("AGFzbQEAAAABDANfAGAAAW9gAW8BfwMDAgECBygCE0pzdl9HZXRFcnJvcl9pbXBvcnQAAA5Kc3ZFcnJvcl9DaGVjawABChMCBwD7AQD7GwsJACAA+xr7FAAL");
	var ge = async function() {
		if (!(globalThis.navigator && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && typeof navigator.maxTouchPoints < "u" && navigator.maxTouchPoints > 1))) try {
			let t = await WebAssembly.compile(G);
			return await WebAssembly.instantiate(t);
		} catch (t) {
			if (t instanceof WebAssembly.CompileError) return;
			throw t;
		}
	}();
	async function K() {
		let e = await ge;
		if (e) return e.exports;
		let t = Symbol("error marker");
		return {
			Jsv_GetError_import: o(() => t, "Jsv_GetError_import"),
			JsvError_Check: o((n) => n === t, "JsvError_Check")
		};
	}
	o(K, "getJsvErrorImport");
	function q(e) {
		let t = {
			config: e,
			runtimeEnv: f
		}, n = {
			noImageDecoding: !0,
			noAudioDecoding: !0,
			noWasmDecoding: !1,
			preRun: Ne(e),
			print: e.stdout,
			printErr: e.stderr,
			onExit(i) {
				n.exitCode = i;
			},
			thisProgram: e._sysExecutable,
			arguments: e.args,
			API: t,
			locateFile: o((i) => e.indexURL + i, "locateFile"),
			instantiateWasm: Ie(e.indexURL)
		};
		return n;
	}
	o(q, "createSettings");
	function ve(e) {
		return function(t) {
			let n = "/";
			try {
				t.FS.mkdirTree(e);
			} catch (i) {
				console.error(`Error occurred while making a home directory '${e}':`), console.error(i), console.error(`Using '${n}' for a home directory instead`), e = n;
			}
			t.FS.chdir(e);
		};
	}
	o(ve, "createHomeDirectory");
	function be(e) {
		return function(t) {
			Object.assign(t.ENV, e);
		};
	}
	o(be, "setEnvironment");
	function Ee(e) {
		return e ? [async (t) => {
			t.addRunDependency("fsInitHook");
			try {
				await e(t.FS, { sitePackages: t.API.sitePackages });
			} finally {
				t.removeRunDependency("fsInitHook");
			}
		}] : [];
	}
	o(Ee, "callFsInitHook");
	function Pe(e) {
		let t = e.HEAPU32[e._Py_Version >>> 2];
		return [
			t >>> 24 & 255,
			t >>> 16 & 255,
			t >>> 8 & 255
		];
	}
	o(Pe, "computeVersionTuple");
	function he(e) {
		let t = j(e);
		return async (n) => {
			n.API.pyVersionTuple = Pe(n);
			let [i, s] = n.API.pyVersionTuple;
			n.FS.mkdirTree("/lib"), n.API.sitePackages = `/lib/python${i}.${s}/site-packages`, n.FS.mkdirTree(n.API.sitePackages), n.FS.mkdirTree(`/lib/python${i}.${s}/lib-dynload`), n.addRunDependency("install-stdlib");
			try {
				let r = await t;
				n.FS.writeFile(`/lib/python${i}${s}.zip`, r);
			} catch (r) {
				console.error("Error occurred while installing the standard library:"), console.error(r);
			} finally {
				n.removeRunDependency("install-stdlib");
			}
		};
	}
	o(he, "installStdlib");
	function Ne(e) {
		let t;
		return e.stdLibURL != null ? t = e.stdLibURL : t = e.indexURL + "python_stdlib.zip", [
			he(t),
			ve(e.env.HOME),
			be(e.env),
			z,
			...Ee(e.fsInit)
		];
	}
	o(Ne, "getFileSystemInitializationFuncs");
	function Ie(e) {
		if (typeof WasmOffsetConverter < "u") return;
		let { binary: t, response: n } = _(e + "pyodide.asm.wasm"), i = K();
		return function(s, r) {
			return async function() {
				let { Jsv_GetError_import: a, JsvError_Check: c } = await i;
				s.env.Jsv_GetError_import = a, s.env.JsvError_Check = c;
				try {
					let l;
					n ? l = await WebAssembly.instantiateStreaming(n, s) : l = await WebAssembly.instantiate(await t, s);
					let { instance: d, module: u } = l;
					r(d, u);
				} catch (l) {
					console.warn("wasm instantiation failed!"), console.warn(l);
				}
			}(), {};
		};
	}
	o(Ie, "getInstantiateWasmFunc");
	var Y = "314.0.6";
	function k(e) {
		return e === void 0 || e.endsWith("/") ? e : e + "/";
	}
	o(k, "withTrailingSlash");
	var U = Y;
	async function Se(e = {}) {
		if (await C(), e.lockFileContents && e.lockFileURL) throw new Error("Can't pass both lockFileContents and lockFileURL");
		let t = e.indexURL || await J();
		if (t = k(w(t)), e.packageBaseUrl = k(e.packageBaseUrl), e.cdnUrl = k(e.packageBaseUrl ?? `https://cdn.jsdelivr.net/pyodide/v314.0.6/full/`), !e.lockFileContents) {
			let s = e.lockFileURL ?? t + "pyodide-lock.json";
			e.lockFileContents = H(s), e.packageBaseUrl ??= V(s);
		}
		e.indexURL = t, e.packageCacheDir && (e.packageCacheDir = k(w(e.packageCacheDir)));
		let n = {
			jsglobals: globalThis,
			stdin: globalThis.prompt ? () => globalThis.prompt() : void 0,
			args: [],
			env: {},
			packages: [],
			packageCacheDir: e.packageBaseUrl,
			enableRunUntilComplete: !0,
			checkAPIVersion: !0,
			BUILD_ID: "6f88bdfdf0581f0eab1d84a508b31ab96e83201d2b7fdd1dc653a3079c23a0f5"
		}, i = Object.assign(n, e);
		return i.env.HOME ??= "/home/pyodide", i.env.PYTHONINSPECT ??= "1", i;
	}
	o(Se, "initializeConfiguration");
	function we(e) {
		let t = q(e), n = t.API;
		return n.lockFilePromise = Promise.resolve(e.lockFileContents), t;
	}
	o(we, "createEmscriptenSettings");
	async function _e(e) {
		if (e.createPyodideModule) return e.createPyodideModule;
		let t = `${e.indexURL}pyodide.asm.mjs`;
		return (await O(t)).default;
	}
	o(_e, "loadWasmScript");
	async function ke(e, t) {
		if (!e._loadSnapshot) return;
		let n = await e._loadSnapshot, i = ArrayBuffer.isView(n) ? n : new Uint8Array(n);
		return t.noInitialRun = !0, t.INITIAL_MEMORY = i.length, i;
	}
	o(ke, "prepareSnapshot");
	async function Re(e, t) {
		let n = await e(t);
		if (t.exitCode !== void 0) throw new n.ExitStatus(t.exitCode);
		return n;
	}
	o(Re, "instantiatePyodideModule");
	function Fe(e, t) {
		let n = e.API;
		if (t.pyproxyToStringRepr && n.setPyProxyToStringMethod(!0), t.convertNullToNone && n.setCompatNullToNone(!0), t.toJsLiteralMap && n.setCompatToJsLiteralMap(!0), n.version !== "314.0.6" && t.checkAPIVersion) throw new Error(`Pyodide version does not match: '${U}' <==> '${n.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`);
		e.locateFile = (i) => {
			throw i.endsWith(".so") ? /* @__PURE__ */ new Error(`Failed to find dynamic library "${i}"`) : /* @__PURE__ */ new Error(`Unexpected call to locateFile("${i}")`);
		};
	}
	o(Fe, "configureAPI");
	function Ae(e, t, n) {
		let i = e.API, s;
		return t && (s = i.restoreSnapshot(t)), i.finalizeBootstrap(s, n._snapshotDeserializer);
	}
	o(Ae, "bootstrapPyodide");
	async function Oe(e, t) {
		let n = e._api;
		return n.sys.path.insert(0, ""), n._pyodide.set_excepthook(), await n.packageIndexReady, n.initializeStreams(t.stdin, t.stdout, t.stderr), e;
	}
	o(Oe, "finalizeSetup");
	async function dt(e = {}) {
		let t = await Se(e), n = we(t), i = await _e(t), s = await ke(t, n), r = await Re(i, n);
		Fe(r, t);
		return await Oe(Ae(r, s, t), t);
	}
	o(dt, "loadPyodide");
	//#endregion
	//#region node_modules/stackframe/stackframe.js
	var require_stackframe = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		(function(root, factory) {
			"use strict";
			/* istanbul ignore next */
			if (typeof define === "function" && define.amd) define("stackframe", [], factory);
			else if (typeof exports === "object") module.exports = factory();
			else root.StackFrame = factory();
		})(exports, function() {
			"use strict";
			function _isNumber(n) {
				return !isNaN(parseFloat(n)) && isFinite(n);
			}
			function _capitalize(str) {
				return str.charAt(0).toUpperCase() + str.substring(1);
			}
			function _getter(p) {
				return function() {
					return this[p];
				};
			}
			var booleanProps = [
				"isConstructor",
				"isEval",
				"isNative",
				"isToplevel"
			];
			var numericProps = ["columnNumber", "lineNumber"];
			var stringProps = [
				"fileName",
				"functionName",
				"source"
			];
			var props = booleanProps.concat(numericProps, stringProps, ["args"], ["evalOrigin"]);
			function StackFrame(obj) {
				if (!obj) return;
				for (var i = 0; i < props.length; i++) if (obj[props[i]] !== void 0) this["set" + _capitalize(props[i])](obj[props[i]]);
			}
			StackFrame.prototype = {
				getArgs: function() {
					return this.args;
				},
				setArgs: function(v) {
					if (Object.prototype.toString.call(v) !== "[object Array]") throw new TypeError("Args must be an Array");
					this.args = v;
				},
				getEvalOrigin: function() {
					return this.evalOrigin;
				},
				setEvalOrigin: function(v) {
					if (v instanceof StackFrame) this.evalOrigin = v;
					else if (v instanceof Object) this.evalOrigin = new StackFrame(v);
					else throw new TypeError("Eval Origin must be an Object or StackFrame");
				},
				toString: function() {
					var fileName = this.getFileName() || "";
					var lineNumber = this.getLineNumber() || "";
					var columnNumber = this.getColumnNumber() || "";
					var functionName = this.getFunctionName() || "";
					if (this.getIsEval()) {
						if (fileName) return "[eval] (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
						return "[eval]:" + lineNumber + ":" + columnNumber;
					}
					if (functionName) return functionName + " (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
					return fileName + ":" + lineNumber + ":" + columnNumber;
				}
			};
			StackFrame.fromString = function StackFrame$$fromString(str) {
				var argsStartIndex = str.indexOf("(");
				var argsEndIndex = str.lastIndexOf(")");
				var functionName = str.substring(0, argsStartIndex);
				var args = str.substring(argsStartIndex + 1, argsEndIndex).split(",");
				var locationString = str.substring(argsEndIndex + 1);
				if (locationString.indexOf("@") === 0) {
					var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, "");
					var fileName = parts[1];
					var lineNumber = parts[2];
					var columnNumber = parts[3];
				}
				return new StackFrame({
					functionName,
					args: args || void 0,
					fileName,
					lineNumber: lineNumber || void 0,
					columnNumber: columnNumber || void 0
				});
			};
			for (var i = 0; i < booleanProps.length; i++) {
				StackFrame.prototype["get" + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
				StackFrame.prototype["set" + _capitalize(booleanProps[i])] = (function(p) {
					return function(v) {
						this[p] = Boolean(v);
					};
				})(booleanProps[i]);
			}
			for (var j = 0; j < numericProps.length; j++) {
				StackFrame.prototype["get" + _capitalize(numericProps[j])] = _getter(numericProps[j]);
				StackFrame.prototype["set" + _capitalize(numericProps[j])] = (function(p) {
					return function(v) {
						if (!_isNumber(v)) throw new TypeError(p + " must be a Number");
						this[p] = Number(v);
					};
				})(numericProps[j]);
			}
			for (var k = 0; k < stringProps.length; k++) {
				StackFrame.prototype["get" + _capitalize(stringProps[k])] = _getter(stringProps[k]);
				StackFrame.prototype["set" + _capitalize(stringProps[k])] = (function(p) {
					return function(v) {
						this[p] = String(v);
					};
				})(stringProps[k]);
			}
			return StackFrame;
		});
	}));
	//#endregion
	//#region node_modules/error-stack-parser/error-stack-parser.js
	var require_error_stack_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		(function(root, factory) {
			"use strict";
			/* istanbul ignore next */
			if (typeof define === "function" && define.amd) define("error-stack-parser", ["stackframe"], factory);
			else if (typeof exports === "object") module.exports = factory(require_stackframe());
			else root.ErrorStackParser = factory(root.StackFrame);
		})(exports, function ErrorStackParser(StackFrame) {
			"use strict";
			var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
			var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
			var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
			return {
				/**
				* Given an Error object, extract the most information from it.
				*
				* @param {Error} error object
				* @return {Array} of StackFrames
				*/
				parse: function ErrorStackParser$$parse(error) {
					if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") return this.parseOpera(error);
					else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) return this.parseV8OrIE(error);
					else if (error.stack) return this.parseFFOrSafari(error);
					else throw new Error("Cannot parse given Error object");
				},
				extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
					if (urlLike.indexOf(":") === -1) return [urlLike];
					var parts = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(urlLike.replace(/[()]/g, ""));
					return [
						parts[1],
						parts[2] || void 0,
						parts[3] || void 0
					];
				},
				parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
					return error.stack.split("\n").filter(function(line) {
						return !!line.match(CHROME_IE_STACK_REGEXP);
					}, this).map(function(line) {
						if (line.indexOf("(eval ") > -1) line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
						var sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
						var location = sanitizedLine.match(/ (\(.+\)$)/);
						sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
						var locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
						return new StackFrame({
							functionName: location && sanitizedLine || void 0,
							fileName: ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0],
							lineNumber: locationParts[1],
							columnNumber: locationParts[2],
							source: line
						});
					}, this);
				},
				parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
					return error.stack.split("\n").filter(function(line) {
						return !line.match(SAFARI_NATIVE_CODE_REGEXP);
					}, this).map(function(line) {
						if (line.indexOf(" > eval") > -1) line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
						if (line.indexOf("@") === -1 && line.indexOf(":") === -1) return new StackFrame({ functionName: line });
						else {
							var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
							var matches = line.match(functionNameRegex);
							var functionName = matches && matches[1] ? matches[1] : void 0;
							var locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
							return new StackFrame({
								functionName,
								fileName: locationParts[0],
								lineNumber: locationParts[1],
								columnNumber: locationParts[2],
								source: line
							});
						}
					}, this);
				},
				parseOpera: function ErrorStackParser$$parseOpera(e) {
					if (!e.stacktrace || e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) return this.parseOpera9(e);
					else if (!e.stack) return this.parseOpera10(e);
					else return this.parseOpera11(e);
				},
				parseOpera9: function ErrorStackParser$$parseOpera9(e) {
					var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
					var lines = e.message.split("\n");
					var result = [];
					for (var i = 2, len = lines.length; i < len; i += 2) {
						var match = lineRE.exec(lines[i]);
						if (match) result.push(new StackFrame({
							fileName: match[2],
							lineNumber: match[1],
							source: lines[i]
						}));
					}
					return result;
				},
				parseOpera10: function ErrorStackParser$$parseOpera10(e) {
					var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
					var lines = e.stacktrace.split("\n");
					var result = [];
					for (var i = 0, len = lines.length; i < len; i += 2) {
						var match = lineRE.exec(lines[i]);
						if (match) result.push(new StackFrame({
							functionName: match[3] || void 0,
							fileName: match[2],
							lineNumber: match[1],
							source: lines[i]
						}));
					}
					return result;
				},
				parseOpera11: function ErrorStackParser$$parseOpera11(error) {
					return error.stack.split("\n").filter(function(line) {
						return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
					}, this).map(function(line) {
						var tokens = line.split("@");
						var locationParts = this.extractLocation(tokens.pop());
						var functionCall = tokens.shift() || "";
						var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
						var argsRaw;
						if (functionCall.match(/\(([^)]*)\)/)) argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
						return new StackFrame({
							functionName,
							args: argsRaw === void 0 || argsRaw === "[arguments not available]" ? void 0 : argsRaw.split(","),
							fileName: locationParts[0],
							lineNumber: locationParts[1],
							columnNumber: locationParts[2],
							source: line
						});
					}, this);
				}
			};
		});
	}));
	//#endregion
	//#region node_modules/stack-generator/stack-generator.js
	var require_stack_generator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		(function(root, factory) {
			"use strict";
			/* istanbul ignore next */
			if (typeof define === "function" && define.amd) define("stack-generator", ["stackframe"], factory);
			else if (typeof exports === "object") module.exports = factory(require_stackframe());
			else root.StackGenerator = factory(root.StackFrame);
		})(exports, function(StackFrame) {
			return { backtrace: function StackGenerator$$backtrace(opts) {
				var stack = [];
				var maxStackSize = 10;
				if (typeof opts === "object" && typeof opts.maxStackSize === "number") maxStackSize = opts.maxStackSize;
				var curr = arguments.callee;
				while (curr && stack.length < maxStackSize && curr["arguments"]) {
					var args = new Array(curr["arguments"].length);
					for (var i = 0; i < args.length; ++i) args[i] = curr["arguments"][i];
					if (/function(?:\s+([\w$]+))+\s*\(/.test(curr.toString())) stack.push(new StackFrame({
						functionName: RegExp.$1 || void 0,
						args
					}));
					else stack.push(new StackFrame({ args }));
					try {
						curr = curr.caller;
					} catch (e) {
						break;
					}
				}
				return stack;
			} };
		});
	}));
	//#endregion
	//#region node_modules/source-map/lib/util.js
	var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
		/**
		* This is a helper function for getting values from parameter/options
		* objects.
		*
		* @param args The object we are extracting values from
		* @param name The name of the property we are getting.
		* @param defaultValue An optional value to return if the property is missing
		* from the object. If this is not specified and the property is missing, an
		* error will be thrown.
		*/
		function getArg(aArgs, aName, aDefaultValue) {
			if (aName in aArgs) return aArgs[aName];
			else if (arguments.length === 3) return aDefaultValue;
			else throw new Error("\"" + aName + "\" is a required argument.");
		}
		exports.getArg = getArg;
		var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
		var dataUrlRegexp = /^data:.+\,.+$/;
		function urlParse(aUrl) {
			var match = aUrl.match(urlRegexp);
			if (!match) return null;
			return {
				scheme: match[1],
				auth: match[2],
				host: match[3],
				port: match[4],
				path: match[5]
			};
		}
		exports.urlParse = urlParse;
		function urlGenerate(aParsedUrl) {
			var url = "";
			if (aParsedUrl.scheme) url += aParsedUrl.scheme + ":";
			url += "//";
			if (aParsedUrl.auth) url += aParsedUrl.auth + "@";
			if (aParsedUrl.host) url += aParsedUrl.host;
			if (aParsedUrl.port) url += ":" + aParsedUrl.port;
			if (aParsedUrl.path) url += aParsedUrl.path;
			return url;
		}
		exports.urlGenerate = urlGenerate;
		/**
		* Normalizes a path, or the path portion of a URL:
		*
		* - Replaces consecutive slashes with one slash.
		* - Removes unnecessary '.' parts.
		* - Removes unnecessary '<dir>/..' parts.
		*
		* Based on code in the Node.js 'path' core module.
		*
		* @param aPath The path or url to normalize.
		*/
		function normalize(aPath) {
			var path = aPath;
			var url = urlParse(aPath);
			if (url) {
				if (!url.path) return aPath;
				path = url.path;
			}
			var isAbsolute = exports.isAbsolute(path);
			var parts = path.split(/\/+/);
			for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
				part = parts[i];
				if (part === ".") parts.splice(i, 1);
				else if (part === "..") up++;
				else if (up > 0) {
					if (part === "") {
						parts.splice(i + 1, up);
						up = 0;
					} else {
						parts.splice(i, 2);
						up--;
					}
				}
			}
			path = parts.join("/");
			if (path === "") path = isAbsolute ? "/" : ".";
			if (url) {
				url.path = path;
				return urlGenerate(url);
			}
			return path;
		}
		exports.normalize = normalize;
		/**
		* Joins two paths/URLs.
		*
		* @param aRoot The root path or URL.
		* @param aPath The path or URL to be joined with the root.
		*
		* - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
		*   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
		*   first.
		* - Otherwise aPath is a path. If aRoot is a URL, then its path portion
		*   is updated with the result and aRoot is returned. Otherwise the result
		*   is returned.
		*   - If aPath is absolute, the result is aPath.
		*   - Otherwise the two paths are joined with a slash.
		* - Joining for example 'http://' and 'www.example.com' is also supported.
		*/
		function join(aRoot, aPath) {
			if (aRoot === "") aRoot = ".";
			if (aPath === "") aPath = ".";
			var aPathUrl = urlParse(aPath);
			var aRootUrl = urlParse(aRoot);
			if (aRootUrl) aRoot = aRootUrl.path || "/";
			if (aPathUrl && !aPathUrl.scheme) {
				if (aRootUrl) aPathUrl.scheme = aRootUrl.scheme;
				return urlGenerate(aPathUrl);
			}
			if (aPathUrl || aPath.match(dataUrlRegexp)) return aPath;
			if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
				aRootUrl.host = aPath;
				return urlGenerate(aRootUrl);
			}
			var joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
			if (aRootUrl) {
				aRootUrl.path = joined;
				return urlGenerate(aRootUrl);
			}
			return joined;
		}
		exports.join = join;
		exports.isAbsolute = function(aPath) {
			return aPath.charAt(0) === "/" || !!aPath.match(urlRegexp);
		};
		/**
		* Make a path relative to a URL or another path.
		*
		* @param aRoot The root path or URL.
		* @param aPath The path or URL to be made relative to aRoot.
		*/
		function relative(aRoot, aPath) {
			if (aRoot === "") aRoot = ".";
			aRoot = aRoot.replace(/\/$/, "");
			var level = 0;
			while (aPath.indexOf(aRoot + "/") !== 0) {
				var index = aRoot.lastIndexOf("/");
				if (index < 0) return aPath;
				aRoot = aRoot.slice(0, index);
				if (aRoot.match(/^([^\/]+:\/)?\/*$/)) return aPath;
				++level;
			}
			return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
		}
		exports.relative = relative;
		var supportsNullProto = function() {
			return !("__proto__" in Object.create(null));
		}();
		function identity(s) {
			return s;
		}
		/**
		* Because behavior goes wacky when you set `__proto__` on objects, we
		* have to prefix all the strings in our set with an arbitrary character.
		*
		* See https://github.com/mozilla/source-map/pull/31 and
		* https://github.com/mozilla/source-map/issues/30
		*
		* @param String aStr
		*/
		function toSetString(aStr) {
			if (isProtoString(aStr)) return "$" + aStr;
			return aStr;
		}
		exports.toSetString = supportsNullProto ? identity : toSetString;
		function fromSetString(aStr) {
			if (isProtoString(aStr)) return aStr.slice(1);
			return aStr;
		}
		exports.fromSetString = supportsNullProto ? identity : fromSetString;
		function isProtoString(s) {
			if (!s) return false;
			var length = s.length;
			if (length < 9) return false;
			if (s.charCodeAt(length - 1) !== 95 || s.charCodeAt(length - 2) !== 95 || s.charCodeAt(length - 3) !== 111 || s.charCodeAt(length - 4) !== 116 || s.charCodeAt(length - 5) !== 111 || s.charCodeAt(length - 6) !== 114 || s.charCodeAt(length - 7) !== 112 || s.charCodeAt(length - 8) !== 95 || s.charCodeAt(length - 9) !== 95) return false;
			for (var i = length - 10; i >= 0; i--) if (s.charCodeAt(i) !== 36) return false;
			return true;
		}
		/**
		* Comparator between two mappings where the original positions are compared.
		*
		* Optionally pass in `true` as `onlyCompareGenerated` to consider two
		* mappings with the same original source/line/column, but different generated
		* line and column the same. Useful when searching for a mapping with a
		* stubbed out mapping.
		*/
		function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
			var cmp = mappingA.source - mappingB.source;
			if (cmp !== 0) return cmp;
			cmp = mappingA.originalLine - mappingB.originalLine;
			if (cmp !== 0) return cmp;
			cmp = mappingA.originalColumn - mappingB.originalColumn;
			if (cmp !== 0 || onlyCompareOriginal) return cmp;
			cmp = mappingA.generatedColumn - mappingB.generatedColumn;
			if (cmp !== 0) return cmp;
			cmp = mappingA.generatedLine - mappingB.generatedLine;
			if (cmp !== 0) return cmp;
			return mappingA.name - mappingB.name;
		}
		exports.compareByOriginalPositions = compareByOriginalPositions;
		/**
		* Comparator between two mappings with deflated source and name indices where
		* the generated positions are compared.
		*
		* Optionally pass in `true` as `onlyCompareGenerated` to consider two
		* mappings with the same generated line and column, but different
		* source/name/original line and column the same. Useful when searching for a
		* mapping with a stubbed out mapping.
		*/
		function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
			var cmp = mappingA.generatedLine - mappingB.generatedLine;
			if (cmp !== 0) return cmp;
			cmp = mappingA.generatedColumn - mappingB.generatedColumn;
			if (cmp !== 0 || onlyCompareGenerated) return cmp;
			cmp = mappingA.source - mappingB.source;
			if (cmp !== 0) return cmp;
			cmp = mappingA.originalLine - mappingB.originalLine;
			if (cmp !== 0) return cmp;
			cmp = mappingA.originalColumn - mappingB.originalColumn;
			if (cmp !== 0) return cmp;
			return mappingA.name - mappingB.name;
		}
		exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
		function strcmp(aStr1, aStr2) {
			if (aStr1 === aStr2) return 0;
			if (aStr1 > aStr2) return 1;
			return -1;
		}
		/**
		* Comparator between two mappings with inflated source and name strings where
		* the generated positions are compared.
		*/
		function compareByGeneratedPositionsInflated(mappingA, mappingB) {
			var cmp = mappingA.generatedLine - mappingB.generatedLine;
			if (cmp !== 0) return cmp;
			cmp = mappingA.generatedColumn - mappingB.generatedColumn;
			if (cmp !== 0) return cmp;
			cmp = strcmp(mappingA.source, mappingB.source);
			if (cmp !== 0) return cmp;
			cmp = mappingA.originalLine - mappingB.originalLine;
			if (cmp !== 0) return cmp;
			cmp = mappingA.originalColumn - mappingB.originalColumn;
			if (cmp !== 0) return cmp;
			return strcmp(mappingA.name, mappingB.name);
		}
		exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
	}));
	//#endregion
	//#region node_modules/source-map/lib/binary-search.js
	var require_binary_search = /* @__PURE__ */ __commonJSMin(((exports) => {
		exports.GREATEST_LOWER_BOUND = 1;
		exports.LEAST_UPPER_BOUND = 2;
		/**
		* Recursive implementation of binary search.
		*
		* @param aLow Indices here and lower do not contain the needle.
		* @param aHigh Indices here and higher do not contain the needle.
		* @param aNeedle The element being searched for.
		* @param aHaystack The non-empty array being searched.
		* @param aCompare Function which takes two elements and returns -1, 0, or 1.
		* @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
		*     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
		*     closest element that is smaller than or greater than the one we are
		*     searching for, respectively, if the exact element cannot be found.
		*/
		function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
			var mid = Math.floor((aHigh - aLow) / 2) + aLow;
			var cmp = aCompare(aNeedle, aHaystack[mid], true);
			if (cmp === 0) return mid;
			else if (cmp > 0) {
				if (aHigh - mid > 1) return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
				if (aBias == exports.LEAST_UPPER_BOUND) return aHigh < aHaystack.length ? aHigh : -1;
				else return mid;
			} else {
				if (mid - aLow > 1) return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
				if (aBias == exports.LEAST_UPPER_BOUND) return mid;
				else return aLow < 0 ? -1 : aLow;
			}
		}
		/**
		* This is an implementation of binary search which will always try and return
		* the index of the closest element if there is no exact hit. This is because
		* mappings between original and generated line/col pairs are single points,
		* and there is an implicit region between each of them, so a miss just means
		* that you aren't on the very start of a region.
		*
		* @param aNeedle The element you are looking for.
		* @param aHaystack The array that is being searched.
		* @param aCompare A function which takes the needle and an element in the
		*     array and returns -1, 0, or 1 depending on whether the needle is less
		*     than, equal to, or greater than the element, respectively.
		* @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
		*     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
		*     closest element that is smaller than or greater than the one we are
		*     searching for, respectively, if the exact element cannot be found.
		*     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
		*/
		exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
			if (aHaystack.length === 0) return -1;
			var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
			if (index < 0) return -1;
			while (index - 1 >= 0) {
				if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) break;
				--index;
			}
			return index;
		};
	}));
	//#endregion
	//#region node_modules/source-map/lib/array-set.js
	var require_array_set = /* @__PURE__ */ __commonJSMin(((exports) => {
		var util = require_util();
		var has = Object.prototype.hasOwnProperty;
		/**
		* A data structure which is a combination of an array and a set. Adding a new
		* member is O(1), testing for membership is O(1), and finding the index of an
		* element is O(1). Removing elements from the set is not supported. Only
		* strings are supported for membership.
		*/
		function ArraySet() {
			this._array = [];
			this._set = Object.create(null);
		}
		/**
		* Static method for creating ArraySet instances from an existing array.
		*/
		ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
			var set = new ArraySet();
			for (var i = 0, len = aArray.length; i < len; i++) set.add(aArray[i], aAllowDuplicates);
			return set;
		};
		/**
		* Return how many unique items are in this ArraySet. If duplicates have been
		* added, than those do not count towards the size.
		*
		* @returns Number
		*/
		ArraySet.prototype.size = function ArraySet_size() {
			return Object.getOwnPropertyNames(this._set).length;
		};
		/**
		* Add the given string to this set.
		*
		* @param String aStr
		*/
		ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
			var sStr = util.toSetString(aStr);
			var isDuplicate = has.call(this._set, sStr);
			var idx = this._array.length;
			if (!isDuplicate || aAllowDuplicates) this._array.push(aStr);
			if (!isDuplicate) this._set[sStr] = idx;
		};
		/**
		* Is the given string a member of this set?
		*
		* @param String aStr
		*/
		ArraySet.prototype.has = function ArraySet_has(aStr) {
			var sStr = util.toSetString(aStr);
			return has.call(this._set, sStr);
		};
		/**
		* What is the index of the given string in the array?
		*
		* @param String aStr
		*/
		ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
			var sStr = util.toSetString(aStr);
			if (has.call(this._set, sStr)) return this._set[sStr];
			throw new Error("\"" + aStr + "\" is not in the set.");
		};
		/**
		* What is the element at the given index?
		*
		* @param Number aIdx
		*/
		ArraySet.prototype.at = function ArraySet_at(aIdx) {
			if (aIdx >= 0 && aIdx < this._array.length) return this._array[aIdx];
			throw new Error("No element indexed by " + aIdx);
		};
		/**
		* Returns the array representation of this set (which has the proper indices
		* indicated by indexOf). Note that this is a copy of the internal array used
		* for storing the members so that no one can mess with internal state.
		*/
		ArraySet.prototype.toArray = function ArraySet_toArray() {
			return this._array.slice();
		};
		exports.ArraySet = ArraySet;
	}));
	//#endregion
	//#region node_modules/source-map/lib/base64.js
	var require_base64 = /* @__PURE__ */ __commonJSMin(((exports) => {
		var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
		/**
		* Encode an integer in the range of 0 to 63 to a single base 64 digit.
		*/
		exports.encode = function(number) {
			if (0 <= number && number < intToCharMap.length) return intToCharMap[number];
			throw new TypeError("Must be between 0 and 63: " + number);
		};
		/**
		* Decode a single base 64 character code digit to an integer. Returns -1 on
		* failure.
		*/
		exports.decode = function(charCode) {
			var bigA = 65;
			var bigZ = 90;
			var littleA = 97;
			var littleZ = 122;
			var zero = 48;
			var nine = 57;
			var plus = 43;
			var slash = 47;
			var littleOffset = 26;
			var numberOffset = 52;
			if (bigA <= charCode && charCode <= bigZ) return charCode - bigA;
			if (littleA <= charCode && charCode <= littleZ) return charCode - littleA + littleOffset;
			if (zero <= charCode && charCode <= nine) return charCode - zero + numberOffset;
			if (charCode == plus) return 62;
			if (charCode == slash) return 63;
			return -1;
		};
	}));
	//#endregion
	//#region node_modules/source-map/lib/base64-vlq.js
	var require_base64_vlq = /* @__PURE__ */ __commonJSMin(((exports) => {
		var base64 = require_base64();
		var VLQ_BASE_SHIFT = 5;
		var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
		var VLQ_BASE_MASK = VLQ_BASE - 1;
		var VLQ_CONTINUATION_BIT = VLQ_BASE;
		/**
		* Converts from a two-complement value to a value where the sign bit is
		* placed in the least significant bit.  For example, as decimals:
		*   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
		*   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
		*/
		function toVLQSigned(aValue) {
			return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
		}
		/**
		* Converts to a two-complement value from a value where the sign bit is
		* placed in the least significant bit.  For example, as decimals:
		*   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
		*   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
		*/
		function fromVLQSigned(aValue) {
			var isNegative = (aValue & 1) === 1;
			var shifted = aValue >> 1;
			return isNegative ? -shifted : shifted;
		}
		/**
		* Returns the base 64 VLQ encoded value.
		*/
		exports.encode = function base64VLQ_encode(aValue) {
			var encoded = "";
			var digit;
			var vlq = toVLQSigned(aValue);
			do {
				digit = vlq & VLQ_BASE_MASK;
				vlq >>>= VLQ_BASE_SHIFT;
				if (vlq > 0) digit |= VLQ_CONTINUATION_BIT;
				encoded += base64.encode(digit);
			} while (vlq > 0);
			return encoded;
		};
		/**
		* Decodes the next base 64 VLQ value from the given string and returns the
		* value and the rest of the string via the out parameter.
		*/
		exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
			var strLen = aStr.length;
			var result = 0;
			var shift = 0;
			var continuation, digit;
			do {
				if (aIndex >= strLen) throw new Error("Expected more digits in base 64 VLQ value.");
				digit = base64.decode(aStr.charCodeAt(aIndex++));
				if (digit === -1) throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
				continuation = !!(digit & VLQ_CONTINUATION_BIT);
				digit &= VLQ_BASE_MASK;
				result = result + (digit << shift);
				shift += VLQ_BASE_SHIFT;
			} while (continuation);
			aOutParam.value = fromVLQSigned(result);
			aOutParam.rest = aIndex;
		};
	}));
	//#endregion
	//#region node_modules/source-map/lib/quick-sort.js
	var require_quick_sort = /* @__PURE__ */ __commonJSMin(((exports) => {
		/**
		* Swap the elements indexed by `x` and `y` in the array `ary`.
		*
		* @param {Array} ary
		*        The array.
		* @param {Number} x
		*        The index of the first item.
		* @param {Number} y
		*        The index of the second item.
		*/
		function swap(ary, x, y) {
			var temp = ary[x];
			ary[x] = ary[y];
			ary[y] = temp;
		}
		/**
		* Returns a random integer within the range `low .. high` inclusive.
		*
		* @param {Number} low
		*        The lower bound on the range.
		* @param {Number} high
		*        The upper bound on the range.
		*/
		function randomIntInRange(low, high) {
			return Math.round(low + Math.random() * (high - low));
		}
		/**
		* The Quick Sort algorithm.
		*
		* @param {Array} ary
		*        An array to sort.
		* @param {function} comparator
		*        Function to use to compare two items.
		* @param {Number} p
		*        Start index of the array
		* @param {Number} r
		*        End index of the array
		*/
		function doQuickSort(ary, comparator, p, r) {
			if (p < r) {
				var pivotIndex = randomIntInRange(p, r);
				var i = p - 1;
				swap(ary, pivotIndex, r);
				var pivot = ary[r];
				for (var j = p; j < r; j++) if (comparator(ary[j], pivot) <= 0) {
					i += 1;
					swap(ary, i, j);
				}
				swap(ary, i + 1, j);
				var q = i + 1;
				doQuickSort(ary, comparator, p, q - 1);
				doQuickSort(ary, comparator, q + 1, r);
			}
		}
		/**
		* Sort the given array in-place with the given comparator function.
		*
		* @param {Array} ary
		*        An array to sort.
		* @param {function} comparator
		*        Function to use to compare two items.
		*/
		exports.quickSort = function(ary, comparator) {
			doQuickSort(ary, comparator, 0, ary.length - 1);
		};
	}));
	//#endregion
	//#region node_modules/source-map/lib/source-map-consumer.js
	var require_source_map_consumer = /* @__PURE__ */ __commonJSMin(((exports) => {
		var util = require_util();
		var binarySearch = require_binary_search();
		var ArraySet = require_array_set().ArraySet;
		var base64VLQ = require_base64_vlq();
		var quickSort = require_quick_sort().quickSort;
		function SourceMapConsumer(aSourceMap) {
			var sourceMap = aSourceMap;
			if (typeof aSourceMap === "string") sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
			return sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap) : new BasicSourceMapConsumer(sourceMap);
		}
		SourceMapConsumer.fromSourceMap = function(aSourceMap) {
			return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
		};
		/**
		* The version of the source mapping spec that we are consuming.
		*/
		SourceMapConsumer.prototype._version = 3;
		SourceMapConsumer.prototype.__generatedMappings = null;
		Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", { get: function() {
			if (!this.__generatedMappings) this._parseMappings(this._mappings, this.sourceRoot);
			return this.__generatedMappings;
		} });
		SourceMapConsumer.prototype.__originalMappings = null;
		Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", { get: function() {
			if (!this.__originalMappings) this._parseMappings(this._mappings, this.sourceRoot);
			return this.__originalMappings;
		} });
		SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
			var c = aStr.charAt(index);
			return c === ";" || c === ",";
		};
		/**
		* Parse the mappings in a string in to a data structure which we can easily
		* query (the ordered arrays in the `this.__generatedMappings` and
		* `this.__originalMappings` properties).
		*/
		SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
			throw new Error("Subclasses must implement _parseMappings");
		};
		SourceMapConsumer.GENERATED_ORDER = 1;
		SourceMapConsumer.ORIGINAL_ORDER = 2;
		SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
		SourceMapConsumer.LEAST_UPPER_BOUND = 2;
		/**
		* Iterate over each mapping between an original source/line/column and a
		* generated line/column in this source map.
		*
		* @param Function aCallback
		*        The function that is called with each mapping.
		* @param Object aContext
		*        Optional. If specified, this object will be the value of `this` every
		*        time that `aCallback` is called.
		* @param aOrder
		*        Either `SourceMapConsumer.GENERATED_ORDER` or
		*        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
		*        iterate over the mappings sorted by the generated file's line/column
		*        order or the original's source/line/column order, respectively. Defaults to
		*        `SourceMapConsumer.GENERATED_ORDER`.
		*/
		SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
			var context = aContext || null;
			var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
			var mappings;
			switch (order) {
				case SourceMapConsumer.GENERATED_ORDER:
					mappings = this._generatedMappings;
					break;
				case SourceMapConsumer.ORIGINAL_ORDER:
					mappings = this._originalMappings;
					break;
				default: throw new Error("Unknown order of iteration.");
			}
			var sourceRoot = this.sourceRoot;
			mappings.map(function(mapping) {
				var source = mapping.source === null ? null : this._sources.at(mapping.source);
				if (source != null && sourceRoot != null) source = util.join(sourceRoot, source);
				return {
					source,
					generatedLine: mapping.generatedLine,
					generatedColumn: mapping.generatedColumn,
					originalLine: mapping.originalLine,
					originalColumn: mapping.originalColumn,
					name: mapping.name === null ? null : this._names.at(mapping.name)
				};
			}, this).forEach(aCallback, context);
		};
		/**
		* Returns all generated line and column information for the original source,
		* line, and column provided. If no column is provided, returns all mappings
		* corresponding to a either the line we are searching for or the next
		* closest line that has any mappings. Otherwise, returns all mappings
		* corresponding to the given line and either the column we are searching for
		* or the next closest column that has any offsets.
		*
		* The only argument is an object with the following properties:
		*
		*   - source: The filename of the original source.
		*   - line: The line number in the original source.
		*   - column: Optional. the column number in the original source.
		*
		* and an array of objects is returned, each with the following properties:
		*
		*   - line: The line number in the generated source, or null.
		*   - column: The column number in the generated source, or null.
		*/
		SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
			var line = util.getArg(aArgs, "line");
			var needle = {
				source: util.getArg(aArgs, "source"),
				originalLine: line,
				originalColumn: util.getArg(aArgs, "column", 0)
			};
			if (this.sourceRoot != null) needle.source = util.relative(this.sourceRoot, needle.source);
			if (!this._sources.has(needle.source)) return [];
			needle.source = this._sources.indexOf(needle.source);
			var mappings = [];
			var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
			if (index >= 0) {
				var mapping = this._originalMappings[index];
				if (aArgs.column === void 0) {
					var originalLine = mapping.originalLine;
					while (mapping && mapping.originalLine === originalLine) {
						mappings.push({
							line: util.getArg(mapping, "generatedLine", null),
							column: util.getArg(mapping, "generatedColumn", null),
							lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
						});
						mapping = this._originalMappings[++index];
					}
				} else {
					var originalColumn = mapping.originalColumn;
					while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
						mappings.push({
							line: util.getArg(mapping, "generatedLine", null),
							column: util.getArg(mapping, "generatedColumn", null),
							lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
						});
						mapping = this._originalMappings[++index];
					}
				}
			}
			return mappings;
		};
		exports.SourceMapConsumer = SourceMapConsumer;
		/**
		* A BasicSourceMapConsumer instance represents a parsed source map which we can
		* query for information about the original file positions by giving it a file
		* position in the generated source.
		*
		* The only parameter is the raw source map (either as a JSON string, or
		* already parsed to an object). According to the spec, source maps have the
		* following attributes:
		*
		*   - version: Which version of the source map spec this map is following.
		*   - sources: An array of URLs to the original source files.
		*   - names: An array of identifiers which can be referrenced by individual mappings.
		*   - sourceRoot: Optional. The URL root from which all sources are relative.
		*   - sourcesContent: Optional. An array of contents of the original source files.
		*   - mappings: A string of base64 VLQs which contain the actual mappings.
		*   - file: Optional. The generated file this source map is associated with.
		*
		* Here is an example source map, taken from the source map spec[0]:
		*
		*     {
		*       version : 3,
		*       file: "out.js",
		*       sourceRoot : "",
		*       sources: ["foo.js", "bar.js"],
		*       names: ["src", "maps", "are", "fun"],
		*       mappings: "AA,AB;;ABCDE;"
		*     }
		*
		* [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
		*/
		function BasicSourceMapConsumer(aSourceMap) {
			var sourceMap = aSourceMap;
			if (typeof aSourceMap === "string") sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
			var version = util.getArg(sourceMap, "version");
			var sources = util.getArg(sourceMap, "sources");
			var names = util.getArg(sourceMap, "names", []);
			var sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
			var sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
			var mappings = util.getArg(sourceMap, "mappings");
			var file = util.getArg(sourceMap, "file", null);
			if (version != this._version) throw new Error("Unsupported version: " + version);
			sources = sources.map(String).map(util.normalize).map(function(source) {
				return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
			});
			this._names = ArraySet.fromArray(names.map(String), true);
			this._sources = ArraySet.fromArray(sources, true);
			this.sourceRoot = sourceRoot;
			this.sourcesContent = sourcesContent;
			this._mappings = mappings;
			this.file = file;
		}
		BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
		BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
		/**
		* Create a BasicSourceMapConsumer from a SourceMapGenerator.
		*
		* @param SourceMapGenerator aSourceMap
		*        The source map that will be consumed.
		* @returns BasicSourceMapConsumer
		*/
		BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap) {
			var smc = Object.create(BasicSourceMapConsumer.prototype);
			var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
			var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
			smc.sourceRoot = aSourceMap._sourceRoot;
			smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
			smc.file = aSourceMap._file;
			var generatedMappings = aSourceMap._mappings.toArray().slice();
			var destGeneratedMappings = smc.__generatedMappings = [];
			var destOriginalMappings = smc.__originalMappings = [];
			for (var i = 0, length = generatedMappings.length; i < length; i++) {
				var srcMapping = generatedMappings[i];
				var destMapping = new Mapping();
				destMapping.generatedLine = srcMapping.generatedLine;
				destMapping.generatedColumn = srcMapping.generatedColumn;
				if (srcMapping.source) {
					destMapping.source = sources.indexOf(srcMapping.source);
					destMapping.originalLine = srcMapping.originalLine;
					destMapping.originalColumn = srcMapping.originalColumn;
					if (srcMapping.name) destMapping.name = names.indexOf(srcMapping.name);
					destOriginalMappings.push(destMapping);
				}
				destGeneratedMappings.push(destMapping);
			}
			quickSort(smc.__originalMappings, util.compareByOriginalPositions);
			return smc;
		};
		/**
		* The version of the source mapping spec that we are consuming.
		*/
		BasicSourceMapConsumer.prototype._version = 3;
		/**
		* The list of original sources.
		*/
		Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", { get: function() {
			return this._sources.toArray().map(function(s) {
				return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
			}, this);
		} });
		/**
		* Provide the JIT with a nice shape / hidden class.
		*/
		function Mapping() {
			this.generatedLine = 0;
			this.generatedColumn = 0;
			this.source = null;
			this.originalLine = null;
			this.originalColumn = null;
			this.name = null;
		}
		/**
		* Parse the mappings in a string in to a data structure which we can easily
		* query (the ordered arrays in the `this.__generatedMappings` and
		* `this.__originalMappings` properties).
		*/
		BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
			var generatedLine = 1;
			var previousGeneratedColumn = 0;
			var previousOriginalLine = 0;
			var previousOriginalColumn = 0;
			var previousSource = 0;
			var previousName = 0;
			var length = aStr.length;
			var index = 0;
			var cachedSegments = {};
			var temp = {};
			var originalMappings = [];
			var generatedMappings = [];
			var mapping, str, segment, end, value;
			while (index < length) if (aStr.charAt(index) === ";") {
				generatedLine++;
				index++;
				previousGeneratedColumn = 0;
			} else if (aStr.charAt(index) === ",") index++;
			else {
				mapping = new Mapping();
				mapping.generatedLine = generatedLine;
				for (end = index; end < length; end++) if (this._charIsMappingSeparator(aStr, end)) break;
				str = aStr.slice(index, end);
				segment = cachedSegments[str];
				if (segment) index += str.length;
				else {
					segment = [];
					while (index < end) {
						base64VLQ.decode(aStr, index, temp);
						value = temp.value;
						index = temp.rest;
						segment.push(value);
					}
					if (segment.length === 2) throw new Error("Found a source, but no line and column");
					if (segment.length === 3) throw new Error("Found a source and line, but no column");
					cachedSegments[str] = segment;
				}
				mapping.generatedColumn = previousGeneratedColumn + segment[0];
				previousGeneratedColumn = mapping.generatedColumn;
				if (segment.length > 1) {
					mapping.source = previousSource + segment[1];
					previousSource += segment[1];
					mapping.originalLine = previousOriginalLine + segment[2];
					previousOriginalLine = mapping.originalLine;
					mapping.originalLine += 1;
					mapping.originalColumn = previousOriginalColumn + segment[3];
					previousOriginalColumn = mapping.originalColumn;
					if (segment.length > 4) {
						mapping.name = previousName + segment[4];
						previousName += segment[4];
					}
				}
				generatedMappings.push(mapping);
				if (typeof mapping.originalLine === "number") originalMappings.push(mapping);
			}
			quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
			this.__generatedMappings = generatedMappings;
			quickSort(originalMappings, util.compareByOriginalPositions);
			this.__originalMappings = originalMappings;
		};
		/**
		* Find the mapping that best matches the hypothetical "needle" mapping that
		* we are searching for in the given "haystack" of mappings.
		*/
		BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
			if (aNeedle[aLineName] <= 0) throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
			if (aNeedle[aColumnName] < 0) throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
			return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
		};
		/**
		* Compute the last column for each generated mapping. The last column is
		* inclusive.
		*/
		BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
			for (var index = 0; index < this._generatedMappings.length; ++index) {
				var mapping = this._generatedMappings[index];
				if (index + 1 < this._generatedMappings.length) {
					var nextMapping = this._generatedMappings[index + 1];
					if (mapping.generatedLine === nextMapping.generatedLine) {
						mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
						continue;
					}
				}
				mapping.lastGeneratedColumn = Infinity;
			}
		};
		/**
		* Returns the original source, line, and column information for the generated
		* source's line and column positions provided. The only argument is an object
		* with the following properties:
		*
		*   - line: The line number in the generated source.
		*   - column: The column number in the generated source.
		*   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
		*     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
		*     closest element that is smaller than or greater than the one we are
		*     searching for, respectively, if the exact element cannot be found.
		*     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
		*
		* and an object is returned with the following properties:
		*
		*   - source: The original source file, or null.
		*   - line: The line number in the original source, or null.
		*   - column: The column number in the original source, or null.
		*   - name: The original identifier, or null.
		*/
		BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
			var needle = {
				generatedLine: util.getArg(aArgs, "line"),
				generatedColumn: util.getArg(aArgs, "column")
			};
			var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositionsDeflated, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
			if (index >= 0) {
				var mapping = this._generatedMappings[index];
				if (mapping.generatedLine === needle.generatedLine) {
					var source = util.getArg(mapping, "source", null);
					if (source !== null) {
						source = this._sources.at(source);
						if (this.sourceRoot != null) source = util.join(this.sourceRoot, source);
					}
					var name = util.getArg(mapping, "name", null);
					if (name !== null) name = this._names.at(name);
					return {
						source,
						line: util.getArg(mapping, "originalLine", null),
						column: util.getArg(mapping, "originalColumn", null),
						name
					};
				}
			}
			return {
				source: null,
				line: null,
				column: null,
				name: null
			};
		};
		/**
		* Return true if we have the source content for every source in the source
		* map, false otherwise.
		*/
		BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
			if (!this.sourcesContent) return false;
			return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
				return sc == null;
			});
		};
		/**
		* Returns the original source content. The only argument is the url of the
		* original source file. Returns null if no original source content is
		* available.
		*/
		BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
			if (!this.sourcesContent) return null;
			if (this.sourceRoot != null) aSource = util.relative(this.sourceRoot, aSource);
			if (this._sources.has(aSource)) return this.sourcesContent[this._sources.indexOf(aSource)];
			var url;
			if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
				var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
				if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
				if ((!url.path || url.path == "/") && this._sources.has("/" + aSource)) return this.sourcesContent[this._sources.indexOf("/" + aSource)];
			}
			if (nullOnMissing) return null;
			else throw new Error("\"" + aSource + "\" is not in the SourceMap.");
		};
		/**
		* Returns the generated line and column information for the original source,
		* line, and column positions provided. The only argument is an object with
		* the following properties:
		*
		*   - source: The filename of the original source.
		*   - line: The line number in the original source.
		*   - column: The column number in the original source.
		*   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
		*     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
		*     closest element that is smaller than or greater than the one we are
		*     searching for, respectively, if the exact element cannot be found.
		*     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
		*
		* and an object is returned with the following properties:
		*
		*   - line: The line number in the generated source, or null.
		*   - column: The column number in the generated source, or null.
		*/
		BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
			var source = util.getArg(aArgs, "source");
			if (this.sourceRoot != null) source = util.relative(this.sourceRoot, source);
			if (!this._sources.has(source)) return {
				line: null,
				column: null,
				lastColumn: null
			};
			source = this._sources.indexOf(source);
			var needle = {
				source,
				originalLine: util.getArg(aArgs, "line"),
				originalColumn: util.getArg(aArgs, "column")
			};
			var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
			if (index >= 0) {
				var mapping = this._originalMappings[index];
				if (mapping.source === needle.source) return {
					line: util.getArg(mapping, "generatedLine", null),
					column: util.getArg(mapping, "generatedColumn", null),
					lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
				};
			}
			return {
				line: null,
				column: null,
				lastColumn: null
			};
		};
		exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
		/**
		* An IndexedSourceMapConsumer instance represents a parsed source map which
		* we can query for information. It differs from BasicSourceMapConsumer in
		* that it takes "indexed" source maps (i.e. ones with a "sections" field) as
		* input.
		*
		* The only parameter is a raw source map (either as a JSON string, or already
		* parsed to an object). According to the spec for indexed source maps, they
		* have the following attributes:
		*
		*   - version: Which version of the source map spec this map is following.
		*   - file: Optional. The generated file this source map is associated with.
		*   - sections: A list of section definitions.
		*
		* Each value under the "sections" field has two fields:
		*   - offset: The offset into the original specified at which this section
		*       begins to apply, defined as an object with a "line" and "column"
		*       field.
		*   - map: A source map definition. This source map could also be indexed,
		*       but doesn't have to be.
		*
		* Instead of the "map" field, it's also possible to have a "url" field
		* specifying a URL to retrieve a source map from, but that's currently
		* unsupported.
		*
		* Here's an example source map, taken from the source map spec[0], but
		* modified to omit a section which uses the "url" field.
		*
		*  {
		*    version : 3,
		*    file: "app.js",
		*    sections: [{
		*      offset: {line:100, column:10},
		*      map: {
		*        version : 3,
		*        file: "section.js",
		*        sources: ["foo.js", "bar.js"],
		*        names: ["src", "maps", "are", "fun"],
		*        mappings: "AAAA,E;;ABCDE;"
		*      }
		*    }],
		*  }
		*
		* [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
		*/
		function IndexedSourceMapConsumer(aSourceMap) {
			var sourceMap = aSourceMap;
			if (typeof aSourceMap === "string") sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
			var version = util.getArg(sourceMap, "version");
			var sections = util.getArg(sourceMap, "sections");
			if (version != this._version) throw new Error("Unsupported version: " + version);
			this._sources = new ArraySet();
			this._names = new ArraySet();
			var lastOffset = {
				line: -1,
				column: 0
			};
			this._sections = sections.map(function(s) {
				if (s.url) throw new Error("Support for url field in sections not implemented.");
				var offset = util.getArg(s, "offset");
				var offsetLine = util.getArg(offset, "line");
				var offsetColumn = util.getArg(offset, "column");
				if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) throw new Error("Section offsets must be ordered and non-overlapping.");
				lastOffset = offset;
				return {
					generatedOffset: {
						generatedLine: offsetLine + 1,
						generatedColumn: offsetColumn + 1
					},
					consumer: new SourceMapConsumer(util.getArg(s, "map"))
				};
			});
		}
		IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
		IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
		/**
		* The version of the source mapping spec that we are consuming.
		*/
		IndexedSourceMapConsumer.prototype._version = 3;
		/**
		* The list of original sources.
		*/
		Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", { get: function() {
			var sources = [];
			for (var i = 0; i < this._sections.length; i++) for (var j = 0; j < this._sections[i].consumer.sources.length; j++) sources.push(this._sections[i].consumer.sources[j]);
			return sources;
		} });
		/**
		* Returns the original source, line, and column information for the generated
		* source's line and column positions provided. The only argument is an object
		* with the following properties:
		*
		*   - line: The line number in the generated source.
		*   - column: The column number in the generated source.
		*
		* and an object is returned with the following properties:
		*
		*   - source: The original source file, or null.
		*   - line: The line number in the original source, or null.
		*   - column: The column number in the original source, or null.
		*   - name: The original identifier, or null.
		*/
		IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
			var needle = {
				generatedLine: util.getArg(aArgs, "line"),
				generatedColumn: util.getArg(aArgs, "column")
			};
			var sectionIndex = binarySearch.search(needle, this._sections, function(needle, section) {
				var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
				if (cmp) return cmp;
				return needle.generatedColumn - section.generatedOffset.generatedColumn;
			});
			var section = this._sections[sectionIndex];
			if (!section) return {
				source: null,
				line: null,
				column: null,
				name: null
			};
			return section.consumer.originalPositionFor({
				line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
				column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
				bias: aArgs.bias
			});
		};
		/**
		* Return true if we have the source content for every source in the source
		* map, false otherwise.
		*/
		IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
			return this._sections.every(function(s) {
				return s.consumer.hasContentsOfAllSources();
			});
		};
		/**
		* Returns the original source content. The only argument is the url of the
		* original source file. Returns null if no original source content is
		* available.
		*/
		IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
			for (var i = 0; i < this._sections.length; i++) {
				var content = this._sections[i].consumer.sourceContentFor(aSource, true);
				if (content) return content;
			}
			if (nullOnMissing) return null;
			else throw new Error("\"" + aSource + "\" is not in the SourceMap.");
		};
		/**
		* Returns the generated line and column information for the original source,
		* line, and column positions provided. The only argument is an object with
		* the following properties:
		*
		*   - source: The filename of the original source.
		*   - line: The line number in the original source.
		*   - column: The column number in the original source.
		*
		* and an object is returned with the following properties:
		*
		*   - line: The line number in the generated source, or null.
		*   - column: The column number in the generated source, or null.
		*/
		IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
			for (var i = 0; i < this._sections.length; i++) {
				var section = this._sections[i];
				if (section.consumer.sources.indexOf(util.getArg(aArgs, "source")) === -1) continue;
				var generatedPosition = section.consumer.generatedPositionFor(aArgs);
				if (generatedPosition) return {
					line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
					column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
				};
			}
			return {
				line: null,
				column: null
			};
		};
		/**
		* Parse the mappings in a string in to a data structure which we can easily
		* query (the ordered arrays in the `this.__generatedMappings` and
		* `this.__originalMappings` properties).
		*/
		IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
			this.__generatedMappings = [];
			this.__originalMappings = [];
			for (var i = 0; i < this._sections.length; i++) {
				var section = this._sections[i];
				var sectionMappings = section.consumer._generatedMappings;
				for (var j = 0; j < sectionMappings.length; j++) {
					var mapping = sectionMappings[j];
					var source = section.consumer._sources.at(mapping.source);
					if (section.consumer.sourceRoot !== null) source = util.join(section.consumer.sourceRoot, source);
					this._sources.add(source);
					source = this._sources.indexOf(source);
					var name = section.consumer._names.at(mapping.name);
					this._names.add(name);
					name = this._names.indexOf(name);
					var adjustedMapping = {
						source,
						generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
						generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
						originalLine: mapping.originalLine,
						originalColumn: mapping.originalColumn,
						name
					};
					this.__generatedMappings.push(adjustedMapping);
					if (typeof adjustedMapping.originalLine === "number") this.__originalMappings.push(adjustedMapping);
				}
			}
			quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
			quickSort(this.__originalMappings, util.compareByOriginalPositions);
		};
		exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
	}));
	//#endregion
	//#region node_modules/stacktrace-gps/stacktrace-gps.js
	var require_stacktrace_gps = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		(function(root, factory) {
			"use strict";
			/* istanbul ignore next */
			if (typeof define === "function" && define.amd) define("stacktrace-gps", ["source-map", "stackframe"], factory);
			else if (typeof exports === "object") module.exports = factory(require_source_map_consumer(), require_stackframe());
			else root.StackTraceGPS = factory(root.SourceMap || root.sourceMap, root.StackFrame);
		})(exports, function(SourceMap, StackFrame) {
			"use strict";
			/**
			* Make a X-Domain request to url and callback.
			*
			* @param {String} url
			* @returns {Promise} with response text if fulfilled
			*/
			function _xdr(url) {
				return new Promise(function(resolve, reject) {
					var req = new XMLHttpRequest();
					req.open("get", url);
					req.onerror = reject;
					req.onreadystatechange = function onreadystatechange() {
						if (req.readyState === 4) {
							if (req.status >= 200 && req.status < 300 || url.substr(0, 7) === "file://" && req.responseText) resolve(req.responseText);
							else reject(/* @__PURE__ */ new Error("HTTP status: " + req.status + " retrieving " + url));
						}
					};
					req.send();
				});
			}
			/**
			* Convert a Base64-encoded string into its original representation.
			* Used for inline sourcemaps.
			*
			* @param {String} b64str Base-64 encoded string
			* @returns {String} original representation of the base64-encoded string.
			*/
			function _atob(b64str) {
				if (typeof window !== "undefined" && window.atob) return window.atob(b64str);
				else throw new Error("You must supply a polyfill for window.atob in this environment");
			}
			function _parseJson(string) {
				if (typeof JSON !== "undefined" && JSON.parse) return JSON.parse(string);
				else throw new Error("You must supply a polyfill for JSON.parse in this environment");
			}
			function _findFunctionName(source, lineNumber) {
				var syntaxes = [
					/['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/,
					/function\s+([^('"`]*?)\s*\(([^)]*)\)/,
					/['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/,
					/\b(?!(?:if|for|switch|while|with|catch)\b)(?:(?:static)\s+)?(\S+)\s*\(.*?\)\s*\{/,
					/['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*\(.*?\)\s*=>/
				];
				var lines = source.split("\n");
				var code = "";
				var maxLines = Math.min(lineNumber, 20);
				for (var i = 0; i < maxLines; ++i) {
					var line = lines[lineNumber - i - 1];
					var commentPos = line.indexOf("//");
					if (commentPos >= 0) line = line.substr(0, commentPos);
					if (line) {
						code = line + code;
						var len = syntaxes.length;
						for (var index = 0; index < len; index++) {
							var m = syntaxes[index].exec(code);
							if (m && m[1]) return m[1];
						}
					}
				}
			}
			function _ensureSupportedEnvironment() {
				if (typeof Object.defineProperty !== "function" || typeof Object.create !== "function") throw new Error("Unable to consume source maps in older browsers");
			}
			function _ensureStackFrameIsLegit(stackframe) {
				if (typeof stackframe !== "object") throw new TypeError("Given StackFrame is not an object");
				else if (typeof stackframe.fileName !== "string") throw new TypeError("Given file name is not a String");
				else if (typeof stackframe.lineNumber !== "number" || stackframe.lineNumber % 1 !== 0 || stackframe.lineNumber < 1) throw new TypeError("Given line number must be a positive integer");
				else if (typeof stackframe.columnNumber !== "number" || stackframe.columnNumber % 1 !== 0 || stackframe.columnNumber < 0) throw new TypeError("Given column number must be a non-negative integer");
				return true;
			}
			function _findSourceMappingURL(source) {
				var sourceMappingUrlRegExp = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/gm;
				var lastSourceMappingUrl;
				var matchSourceMappingUrl;
				while (matchSourceMappingUrl = sourceMappingUrlRegExp.exec(source)) lastSourceMappingUrl = matchSourceMappingUrl[1];
				if (lastSourceMappingUrl) return lastSourceMappingUrl;
				else throw new Error("sourceMappingURL not found");
			}
			function _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache) {
				return new Promise(function(resolve, reject) {
					var loc = sourceMapConsumer.originalPositionFor({
						line: stackframe.lineNumber,
						column: stackframe.columnNumber
					});
					if (loc.source) {
						var mappedSource = sourceMapConsumer.sourceContentFor(loc.source);
						if (mappedSource) sourceCache[loc.source] = mappedSource;
						resolve(new StackFrame({
							functionName: loc.name || stackframe.functionName,
							args: stackframe.args,
							fileName: loc.source,
							lineNumber: loc.line,
							columnNumber: loc.column
						}));
					} else reject(/* @__PURE__ */ new Error("Could not get original source for given stackframe and source map"));
				});
			}
			/**
			* @constructor
			* @param {Object} opts
			*      opts.sourceCache = {url: "Source String"} => preload source cache
			*      opts.sourceMapConsumerCache = {/path/file.js.map: SourceMapConsumer}
			*      opts.offline = True to prevent network requests.
			*              Best effort without sources or source maps.
			*      opts.ajax = Promise returning function to make X-Domain requests
			*/
			return function StackTraceGPS(opts) {
				if (!(this instanceof StackTraceGPS)) return new StackTraceGPS(opts);
				opts = opts || {};
				this.sourceCache = opts.sourceCache || {};
				this.sourceMapConsumerCache = opts.sourceMapConsumerCache || {};
				this.ajax = opts.ajax || _xdr;
				this._atob = opts.atob || _atob;
				this._get = function _get(location) {
					return new Promise(function(resolve, reject) {
						var isDataUrl = location.substr(0, 5) === "data:";
						if (this.sourceCache[location]) resolve(this.sourceCache[location]);
						else if (opts.offline && !isDataUrl) reject(/* @__PURE__ */ new Error("Cannot make network requests in offline mode"));
						else if (isDataUrl) {
							var match = location.match(/^data:application\/json;([\w=:"-]+;)*base64,/);
							if (match) {
								var sourceMapStart = match[0].length;
								var encodedSource = location.substr(sourceMapStart);
								var source = this._atob(encodedSource);
								this.sourceCache[location] = source;
								resolve(source);
							} else reject(/* @__PURE__ */ new Error("The encoding of the inline sourcemap is not supported"));
						} else {
							var xhrPromise = this.ajax(location, { method: "get" });
							this.sourceCache[location] = xhrPromise;
							xhrPromise.then(resolve, reject);
						}
					}.bind(this));
				};
				/**
				* Creating SourceMapConsumers is expensive, so this wraps the creation of a
				* SourceMapConsumer in a per-instance cache.
				*
				* @param {String} sourceMappingURL = URL to fetch source map from
				* @param {String} defaultSourceRoot = Default source root for source map if undefined
				* @returns {Promise} that resolves a SourceMapConsumer
				*/
				this._getSourceMapConsumer = function _getSourceMapConsumer(sourceMappingURL, defaultSourceRoot) {
					return new Promise(function(resolve) {
						if (this.sourceMapConsumerCache[sourceMappingURL]) resolve(this.sourceMapConsumerCache[sourceMappingURL]);
						else {
							var sourceMapConsumerPromise = new Promise(function(resolve, reject) {
								return this._get(sourceMappingURL).then(function(sourceMapSource) {
									if (typeof sourceMapSource === "string") sourceMapSource = _parseJson(sourceMapSource.replace(/^\)\]\}'/, ""));
									if (typeof sourceMapSource.sourceRoot === "undefined") sourceMapSource.sourceRoot = defaultSourceRoot;
									resolve(new SourceMap.SourceMapConsumer(sourceMapSource));
								}).catch(reject);
							}.bind(this));
							this.sourceMapConsumerCache[sourceMappingURL] = sourceMapConsumerPromise;
							resolve(sourceMapConsumerPromise);
						}
					}.bind(this));
				};
				/**
				* Given a StackFrame, enhance function name and use source maps for a
				* better StackFrame.
				*
				* @param {StackFrame} stackframe object
				* @returns {Promise} that resolves with with source-mapped StackFrame
				*/
				this.pinpoint = function StackTraceGPS$$pinpoint(stackframe) {
					return new Promise(function(resolve, reject) {
						this.getMappedLocation(stackframe).then(function(mappedStackFrame) {
							function resolveMappedStackFrame() {
								resolve(mappedStackFrame);
							}
							this.findFunctionName(mappedStackFrame).then(resolve, resolveMappedStackFrame)["catch"](resolveMappedStackFrame);
						}.bind(this), reject);
					}.bind(this));
				};
				/**
				* Given a StackFrame, guess function name from location information.
				*
				* @param {StackFrame} stackframe
				* @returns {Promise} that resolves with enhanced StackFrame.
				*/
				this.findFunctionName = function StackTraceGPS$$findFunctionName(stackframe) {
					return new Promise(function(resolve, reject) {
						_ensureStackFrameIsLegit(stackframe);
						this._get(stackframe.fileName).then(function getSourceCallback(source) {
							var lineNumber = stackframe.lineNumber;
							var columnNumber = stackframe.columnNumber;
							var guessedFunctionName = _findFunctionName(source, lineNumber, columnNumber);
							if (guessedFunctionName) resolve(new StackFrame({
								functionName: guessedFunctionName,
								args: stackframe.args,
								fileName: stackframe.fileName,
								lineNumber,
								columnNumber
							}));
							else resolve(stackframe);
						}, reject)["catch"](reject);
					}.bind(this));
				};
				/**
				* Given a StackFrame, seek source-mapped location and return new enhanced StackFrame.
				*
				* @param {StackFrame} stackframe
				* @returns {Promise} that resolves with enhanced StackFrame.
				*/
				this.getMappedLocation = function StackTraceGPS$$getMappedLocation(stackframe) {
					return new Promise(function(resolve, reject) {
						_ensureSupportedEnvironment();
						_ensureStackFrameIsLegit(stackframe);
						var sourceCache = this.sourceCache;
						var fileName = stackframe.fileName;
						this._get(fileName).then(function(source) {
							var sourceMappingURL = _findSourceMappingURL(source);
							var isDataUrl = sourceMappingURL.substr(0, 5) === "data:";
							var defaultSourceRoot = fileName.substring(0, fileName.lastIndexOf("/") + 1);
							if (sourceMappingURL[0] !== "/" && !isDataUrl && !/^https?:\/\/|^\/\//i.test(sourceMappingURL)) sourceMappingURL = defaultSourceRoot + sourceMappingURL;
							return this._getSourceMapConsumer(sourceMappingURL, defaultSourceRoot).then(function(sourceMapConsumer) {
								return _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache).then(resolve)["catch"](function() {
									resolve(stackframe);
								});
							});
						}.bind(this), reject)["catch"](reject);
					}.bind(this));
				};
			};
		});
	}));
	//#endregion
	//#region src/utils.ts
	var import_stacktrace = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
		(function(root, factory) {
			"use strict";
			/* istanbul ignore next */
			if (typeof define === "function" && define.amd) define("stacktrace", [
				"error-stack-parser",
				"stack-generator",
				"stacktrace-gps"
			], factory);
			else if (typeof exports === "object") module.exports = factory(require_error_stack_parser(), require_stack_generator(), require_stacktrace_gps());
			else root.StackTrace = factory(root.ErrorStackParser, root.StackGenerator, root.StackTraceGPS);
		})(exports, function StackTrace(ErrorStackParser, StackGenerator, StackTraceGPS) {
			var _options = {
				filter: function(stackframe) {
					return (stackframe.functionName || "").indexOf("StackTrace$$") === -1 && (stackframe.functionName || "").indexOf("ErrorStackParser$$") === -1 && (stackframe.functionName || "").indexOf("StackTraceGPS$$") === -1 && (stackframe.functionName || "").indexOf("StackGenerator$$") === -1;
				},
				sourceCache: {}
			};
			var _generateError = function StackTrace$$GenerateError() {
				try {
					throw new Error();
				} catch (err) {
					return err;
				}
			};
			/**
			* Merge 2 given Objects. If a conflict occurs the second object wins.
			* Does not do deep merges.
			*
			* @param {Object} first base object
			* @param {Object} second overrides
			* @returns {Object} merged first and second
			* @private
			*/
			function _merge(first, second) {
				var target = {};
				[first, second].forEach(function(obj) {
					for (var prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) target[prop] = obj[prop];
					return target;
				});
				return target;
			}
			function _isShapedLikeParsableError(err) {
				return err.stack || err["opera#sourceloc"];
			}
			function _filtered(stackframes, filter) {
				if (typeof filter === "function") return stackframes.filter(filter);
				return stackframes;
			}
			return {
				/**
				* Get a backtrace from invocation point.
				*
				* @param {Object} opts
				* @returns {Array} of StackFrame
				*/
				get: function StackTrace$$get(opts) {
					var err = _generateError();
					return _isShapedLikeParsableError(err) ? this.fromError(err, opts) : this.generateArtificially(opts);
				},
				/**
				* Get a backtrace from invocation point.
				* IMPORTANT: Does not handle source maps or guess function names!
				*
				* @param {Object} opts
				* @returns {Array} of StackFrame
				*/
				getSync: function StackTrace$$getSync(opts) {
					opts = _merge(_options, opts);
					var err = _generateError();
					return _filtered(_isShapedLikeParsableError(err) ? ErrorStackParser.parse(err) : StackGenerator.backtrace(opts), opts.filter);
				},
				/**
				* Given an error object, parse it.
				*
				* @param {Error} error object
				* @param {Object} opts
				* @returns {Promise} for Array[StackFrame}
				*/
				fromError: function StackTrace$$fromError(error, opts) {
					opts = _merge(_options, opts);
					var gps = new StackTraceGPS(opts);
					return new Promise(function(resolve) {
						var stackframes = _filtered(ErrorStackParser.parse(error), opts.filter);
						resolve(Promise.all(stackframes.map(function(sf) {
							return new Promise(function(resolve) {
								function resolveOriginal() {
									resolve(sf);
								}
								gps.pinpoint(sf).then(resolve, resolveOriginal)["catch"](resolveOriginal);
							});
						})));
					}.bind(this));
				},
				/**
				* Use StackGenerator to generate a backtrace.
				*
				* @param {Object} opts
				* @returns {Promise} of Array[StackFrame]
				*/
				generateArtificially: function StackTrace$$generateArtificially(opts) {
					opts = _merge(_options, opts);
					var stackFrames = StackGenerator.backtrace(opts);
					if (typeof opts.filter === "function") stackFrames = stackFrames.filter(opts.filter);
					return Promise.resolve(stackFrames);
				},
				/**
				* Given a function, wrap it such that invocations trigger a callback that
				* is called with a stack trace.
				*
				* @param {Function} fn to be instrumented
				* @param {Function} callback function to call with a stack trace on invocation
				* @param {Function} errback optional function to call with error if unable to get stack trace.
				* @param {Object} thisArg optional context object (e.g. window)
				*/
				instrument: function StackTrace$$instrument(fn, callback, errback, thisArg) {
					if (typeof fn !== "function") throw new Error("Cannot instrument non-function object");
					else if (typeof fn.__stacktraceOriginalFn === "function") return fn;
					var instrumented = function StackTrace$$instrumented() {
						try {
							this.get().then(callback, errback)["catch"](errback);
							return fn.apply(thisArg || this, arguments);
						} catch (e) {
							if (_isShapedLikeParsableError(e)) this.fromError(e).then(callback, errback)["catch"](errback);
							throw e;
						}
					}.bind(this);
					instrumented.__stacktraceOriginalFn = fn;
					return instrumented;
				},
				/**
				* Given a function that has been instrumented,
				* revert the function to it's original (non-instrumented) state.
				*
				* @param {Function} fn to de-instrument
				*/
				deinstrument: function StackTrace$$deinstrument(fn) {
					if (typeof fn !== "function") throw new Error("Cannot de-instrument non-function object");
					else if (typeof fn.__stacktraceOriginalFn === "function") return fn.__stacktraceOriginalFn;
					else return fn;
				},
				/**
				* Given an error message and Array of StackFrames, serialize and POST to given URL.
				*
				* @param {Array} stackframes
				* @param {String} url
				* @param {String} errorMsg
				* @param {Object} requestOptions
				*/
				report: function StackTrace$$report(stackframes, url, errorMsg, requestOptions) {
					return new Promise(function(resolve, reject) {
						var req = new XMLHttpRequest();
						req.onerror = reject;
						req.onreadystatechange = function onreadystatechange() {
							if (req.readyState === 4) {
								if (req.status >= 200 && req.status < 400) resolve(req.responseText);
								else reject(/* @__PURE__ */ new Error("POST to " + url + " failed with status: " + req.status));
							}
						};
						req.open("post", url);
						req.setRequestHeader("Content-Type", "application/json");
						if (requestOptions && typeof requestOptions.headers === "object") {
							var headers = requestOptions.headers;
							for (var header in headers) if (Object.prototype.hasOwnProperty.call(headers, header)) req.setRequestHeader(header, headers[header]);
						}
						var reportPayload = { stack: stackframes };
						if (errorMsg !== void 0 && errorMsg !== null) reportPayload.message = errorMsg;
						req.send(JSON.stringify(reportPayload));
					});
				}
			};
		});
	})))(), 1);
	function Logger() {
		function loggerImpl(logger, msg, ...args) {
			const timestamp = (/* @__PURE__ */ new Date()).toISOString();
			getCallerLocation(3).then((caller) => {
				let text = `${timestamp} [${logger.name}]`;
				text += ` ${caller.fileName}:${caller.lineNumber}`;
				text += ` (${caller.functionName}): ${msg}`;
				logger(text, ...args);
			});
		}
		return {
			debug(msg, ...args) {},
			info(msg, ...args) {
				loggerImpl(console.info, msg, ...args);
			},
			error(msg, ...args) {
				loggerImpl(console.error, msg, ...args);
			},
			warn(msg, ...args) {
				loggerImpl(console.warn, msg, ...args);
			}
		};
	}
	async function getCallerLocation(depth) {
		const err = /* @__PURE__ */ new Error();
		const frame = (await import_stacktrace.default.fromError(err))[depth];
		return {
			fileName: frame.fileName ? cleanPath(frame.fileName) : "<unknown>",
			functionName: frame.functionName ?? "<anonymous>",
			lineNumber: frame.lineNumber ?? -1
		};
	}
	/**
	* Limpa parâmetros do Vite (ex: ?t=1690000) e URLs completas
	* deixando apenas o caminho relativo do arquivo (ex: "src/worker.ts")
	*/
	function cleanPath(rawUrl) {
		if (!rawUrl) return "unknown";
		try {
			const pathname = new URL(rawUrl).pathname;
			return pathname.startsWith("/") ? pathname.slice(1) : pathname;
		} catch {
			return rawUrl;
		}
	}
	//#endregion
	//#region src/components/PythonEnvironment/utils.ts
	function maybeDestroy(obj) {
		if (typeof obj?.destroy === "function" && !obj.isDestroyed?.()) try {
			obj?.destroy();
		} catch {}
	}
	function toTransfer(val, depth = 10) {
		const buffers = [];
		function walk(currentVal, currentDepth) {
			if (currentVal === null || currentVal === void 0 || currentDepth <= 0) return currentVal;
			if (typeof currentVal === "function") throw new Error("Cannot serialize a function");
			if (typeof currentVal === "object" && currentVal.constructor?.name === "PyBuffer") {
				const typedArray = currentVal.toJs();
				if (typeof currentVal.release === "function") currentVal.release();
				buffers.push(typedArray.buffer);
				return typedArray;
			}
			if (ArrayBuffer.isView(currentVal) && !(currentVal instanceof DataView)) {
				buffers.push(currentVal.buffer);
				return currentVal;
			}
			if (typeof currentVal?.toJs === "function") return walk(currentVal.toJs({
				create_proxies: false,
				depth: currentDepth,
				dict_converter: Object.fromEntries
			}), currentDepth - 1);
			if (Array.isArray(currentVal)) return currentVal.map((v) => walk(v, currentDepth - 1));
			if (typeof currentVal === "object" && currentVal.constructor === Object) {
				const result = {};
				for (const [key, value] of Object.entries(currentVal)) result[key] = walk(value, currentDepth - 1);
				return result;
			}
			return currentVal;
		}
		return [{ data: walk(val, depth) }, buffers];
	}
	//#endregion
	//#region src/components/PythonEnvironment/worker.ts
	const PYTHON_MODULES = /* #__PURE__ */ Object.assign({
		"/src/components/MolstarScripts/index.py": MolstarScripts_exports,
		"/src/components/PythonTerminal/index.py": PythonTerminal_exports
	});
	let PYODIDE_INSTANCE = null;
	function getPyodide() {
		if (!PYODIDE_INSTANCE) throw new Error("Pyodide is null.");
		return PYODIDE_INSTANCE;
	}
	function setPyodide(pyodide) {
		PYODIDE_INSTANCE = pyodide;
	}
	const log = Logger();
	let CURRENT_STATE = "DOWN";
	const STATE_LISTENERS = /* @__PURE__ */ new Set();
	function setCurrentState(state, error) {
		CURRENT_STATE = state;
		for (const cb of STATE_LISTENERS) cb(CURRENT_STATE, error);
	}
	const STDOUT_LISTENERS = [];
	const STDERR_LISTENERS = [];
	expose({
		async setup() {
			let pyodide;
			setCurrentState("INITIALIZING");
			try {
				pyodide = await newPyodide();
				setPyodide(pyodide);
				setCurrentState("WORKING");
			} catch (err) {
				const msg = `Failed to initialize.`;
				log.error(msg, err);
				setCurrentState("FAILED", msg);
			}
		},
		async subscribeStateChanges(callback) {
			STATE_LISTENERS.add(callback);
		},
		async runCodeOnWorker(script, options) {
			const pyodide = await getPyodide();
			let pyGlobals;
			let rawResult;
			try {
				log.debug("Running code string on worker");
				const options_ = options?.data;
				const globals = options_?.globals;
				if (globals?.data) {
					pyGlobals = pyodide.toPy(globals.data);
					rawResult = await pyodide.runPythonAsync(script, { globals: pyGlobals });
				} else rawResult = await pyodide.runPythonAsync(script);
				if (options_?.printRepr && rawResult !== void 0) {
					const pyRawResult = pyodide.toPy(rawResult);
					pyodide.globals.set("__rv", pyRawResult);
					await pyodide.runPythonAsync("print(__rv)");
					pyodide.globals.delete("__rv");
					maybeDestroy(pyRawResult);
				}
				return transfer(...toTransfer(rawResult));
			} catch (err) {
				log.error("Failed to run source code", err);
				throw err;
			} finally {
				maybeDestroy(pyGlobals);
				maybeDestroy(rawResult);
			}
		},
		async callWorkerFunction(fnName, args, kwargs, moduleName) {
			const pyodide = await getPyodide();
			if (!moduleName) {
				const index = fnName.lastIndexOf(".");
				if (index > -1) {
					moduleName = fnName.slice(0, index);
					fnName = fnName.slice(index + 1);
				}
			}
			let fn;
			let mod = null;
			let pyKwargs = null;
			let results;
			if (moduleName) {
				mod = pyodide.pyimport(moduleName);
				if (!mod) throw new Error(`Module ${moduleName} not found`);
				fn = mod[fnName];
			} else fn = pyodide.globals[fnName];
			if (!fn) {
				let msg = `Function ${fnName} not found`;
				if (moduleName) msg += ` at ${moduleName}`;
				throw new Error(msg);
			}
			try {
				if (kwargs?.data !== void 0) {
					pyKwargs = pyodide.toPy(kwargs.data);
					results = await fn.callKwargs(...args.data, pyKwargs);
				} else results = await fn.call({}, ...args.data);
				return transfer(...toTransfer(results));
			} finally {
				if (moduleName) maybeDestroy(fn);
				maybeDestroy(mod);
				maybeDestroy(pyKwargs);
				maybeDestroy(results);
			}
		},
		async configureStdout(callback) {
			STDOUT_LISTENERS.push(callback);
		},
		async configureStderr(callback) {
			STDERR_LISTENERS.push(callback);
		},
		async registerMainThreadFunction(fnName, callback) {
			log.debug(`Will register ${fnName} on the main thread.`);
			async function wrapper(...args) {
				let rawResult;
				try {
					rawResult = await callback(transfer(...toTransfer(args)));
					return rawResult.data;
				} catch (err) {
					log.error(`Error on main thread function ${fnName}`, err);
					throw err;
				}
			}
			getPyodide().globals.set(fnName, wrapper);
		}
	});
	async function newPyodide() {
		const url = new URL(location.toString());
		const pyodideIndexUrl = url.protocol + "//" + url.host + "/MolStarTpy/pyodide";
		console.warn("pyodideIndexUrl", pyodideIndexUrl);
		const PYTHON_WHEELS = [
			"micropip",
			"numpy",
			"scipy",
			pyodideIndexUrl + "/tmtools-0.3.0-cp314-cp314-pyemscripten_2026_0_wasm32.whl"
		];
		try {
			log.debug("Initializing Pyodide...");
			const pyodide = await dt({
				indexURL: pyodideIndexUrl,
				stdout: (text) => {
					for (const cb of STDOUT_LISTENERS) cb(text);
				},
				stderr: (text) => {
					for (const cb of STDERR_LISTENERS) cb(text);
				}
			});
			await pyodide.loadPackage(PYTHON_WHEELS, {
				messageCallback: log.debug,
				errorCallback: log.error,
				checkIntegrity: false
			});
			await pyodide.pyimport("tmtools");
			await pyodide.pyimport("numpy");
			log.debug("Load Python modules at component level.");
			const modulesRoot = "/python-environment";
			if (!pyodide.FS.analyzePath(modulesRoot).exists) pyodide.FS.mkdir(modulesRoot);
			Object.entries(PYTHON_MODULES).forEach(([filePath, rawContent]) => {
				const fileComponents = filePath.split("/");
				const fileDir = fileComponents[3];
				const moduleDir = `${modulesRoot}/${fileDir}`;
				let sourceCode = "default" in rawContent ? rawContent.default : rawContent;
				if (!pyodide.FS.analyzePath(moduleDir).exists) pyodide.FS.mkdir(moduleDir);
				let fileName = fileComponents[fileComponents.length - 1];
				if (fileName == "index.py") fileName = "__init__.py";
				pyodide.FS.writeFile(`${moduleDir}/${fileName}`, sourceCode);
			});
			log.debug("Adding /python-environment to the PYTHONPATH");
			pyodide.runPythonAsync(`
            import sys
            sys.path.insert(0, "/python-environment")
        `);
			log.debug("Pyodide worker configuration done!");
			return pyodide;
		} catch (err) {
			log.error(`Initialization of Pyodide failed.`, err);
			throw err;
		}
	}
	//#endregion
})();

//# sourceMappingURL=worker-BLM0H8Pz.js.map