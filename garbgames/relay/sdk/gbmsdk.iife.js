var __GBMSDK__ = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // node_modules/@huggingface/hub/dist/browser/sha256-wrapper-DYTB3MXW.mjs
  var sha256_wrapper_DYTB3MXW_exports = {};
  __export(sha256_wrapper_DYTB3MXW_exports, {
    createSHA256: () => createSHA256,
    createSHA256WorkerCode: () => createSHA256WorkerCode
  });
  async function createSHA256(isInsideWorker = false) {
    const BUFFER_MAX_SIZE = 8 * 1024 * 1024;
    const wasm = isInsideWorker ? (
      // @ts-expect-error WasmModule will be populated inside self object
      await self["SHA256WasmModule"]()
    ) : await sha256_default();
    const heap = wasm.HEAPU8.subarray(wasm._GetBufferPtr());
    return {
      init() {
        wasm._Hash_Init(256);
      },
      update(data) {
        let byteUsed = 0;
        while (byteUsed < data.byteLength) {
          const bytesLeft = data.byteLength - byteUsed;
          const length = Math.min(bytesLeft, BUFFER_MAX_SIZE);
          heap.set(data.subarray(byteUsed, byteUsed + length));
          wasm._Hash_Update(length);
          byteUsed += length;
        }
      },
      digest(method) {
        if (method !== "hex") {
          throw new Error("Only digest hex is supported");
        }
        wasm._Hash_Final();
        const result = Array.from(heap.slice(0, 32));
        return result.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    };
  }
  function createSHA256WorkerCode() {
    return `
		self.addEventListener('message', async (event) => {
      const { file } = event.data;
      const sha256 = await self.createSHA256(true);
      sha256.init();
      const reader = file.stream().getReader();
      const total = file.size;
      let bytesDone = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        sha256.update(value);
        bytesDone += value.length;
        postMessage({ progress: bytesDone / total });
      }
      postMessage({ sha256: sha256.digest('hex') });
    });
    self.SHA256WasmModule = ${sha256_default.toString()};
    self.createSHA256 = ${createSHA256.toString()};
  `;
  }
  var import_meta, Module, sha256_default;
  var init_sha256_wrapper_DYTB3MXW = __esm({
    "node_modules/@huggingface/hub/dist/browser/sha256-wrapper-DYTB3MXW.mjs"() {
      import_meta = {};
      Module = (() => {
        var _unused = import_meta.url;
        return function(moduleArg = {}) {
          var Module2 = moduleArg;
          var readyPromiseResolve, readyPromiseReject;
          Module2["ready"] = new Promise((resolve2, reject) => {
            readyPromiseResolve = resolve2;
            readyPromiseReject = reject;
          });
          var moduleOverrides = Object.assign({}, Module2);
          var arguments_ = [];
          var thisProgram = "./this.program";
          var quit_ = (status, toThrow) => {
            throw toThrow;
          };
          var ENVIRONMENT_IS_WEB = typeof window == "object";
          var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
          var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
          var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
          var scriptDirectory = "";
          function locateFile(path) {
            if (Module2["locateFile"]) {
              return Module2["locateFile"](path, scriptDirectory);
            }
            return scriptDirectory + path;
          }
          var read_, readAsync, readBinary;
          if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
            if (ENVIRONMENT_IS_WORKER) {
              scriptDirectory = self.location.href;
            } else if (typeof document != "undefined" && document.currentScript) {
              scriptDirectory = document.currentScript.src;
            }
            if (false) {
              scriptDirectory = false;
            }
            if (scriptDirectory.startsWith("blob:")) {
              scriptDirectory = "";
            } else {
              scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
            }
            {
              read_ = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.send(null);
                return xhr.responseText;
              };
              if (ENVIRONMENT_IS_WORKER) {
                readBinary = (url) => {
                  var xhr = new XMLHttpRequest();
                  xhr.open("GET", url, false);
                  xhr.responseType = "arraybuffer";
                  xhr.send(null);
                  return new Uint8Array(
                    /** @type{!ArrayBuffer} */
                    xhr.response
                  );
                };
              }
              readAsync = (url, onload, onerror) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = () => {
                  if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                    onload(xhr.response);
                    return;
                  }
                  onerror();
                };
                xhr.onerror = onerror;
                xhr.send(null);
              };
            }
          } else {
          }
          var out = Module2["print"] || console.log.bind(console);
          var err = Module2["printErr"] || console.error.bind(console);
          Object.assign(Module2, moduleOverrides);
          moduleOverrides = null;
          if (Module2["arguments"])
            arguments_ = Module2["arguments"];
          if (Module2["thisProgram"])
            thisProgram = Module2["thisProgram"];
          if (Module2["quit"])
            quit_ = Module2["quit"];
          var wasmBinary;
          if (Module2["wasmBinary"])
            wasmBinary = Module2["wasmBinary"];
          if (typeof WebAssembly != "object") {
            abort("no native wasm support detected");
          }
          function intArrayFromBase64(s) {
            var decoded = atob(s);
            var bytes = new Uint8Array(decoded.length);
            for (var i = 0; i < decoded.length; ++i) {
              bytes[i] = decoded.charCodeAt(i);
            }
            return bytes;
          }
          function tryParseAsDataURI(filename) {
            if (!isDataURI(filename)) {
              return;
            }
            return intArrayFromBase64(filename.slice(dataURIPrefix.length));
          }
          var wasmMemory3;
          var ABORT = false;
          var EXITSTATUS;
          function assert(condition, text) {
            if (!condition) {
              abort(text);
            }
          }
          var HEAP, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
          function updateMemoryViews() {
            var b = wasmMemory3.buffer;
            Module2["HEAP8"] = HEAP8 = new Int8Array(b);
            Module2["HEAP16"] = HEAP16 = new Int16Array(b);
            Module2["HEAPU8"] = HEAPU8 = new Uint8Array(b);
            Module2["HEAPU16"] = HEAPU16 = new Uint16Array(b);
            Module2["HEAP32"] = HEAP32 = new Int32Array(b);
            Module2["HEAPU32"] = HEAPU32 = new Uint32Array(b);
            Module2["HEAPF32"] = HEAPF32 = new Float32Array(b);
            Module2["HEAPF64"] = HEAPF64 = new Float64Array(b);
          }
          var __ATPRERUN__ = [];
          var __ATINIT__ = [];
          var __ATEXIT__ = [];
          var __ATPOSTRUN__ = [];
          var runtimeInitialized = false;
          function preRun() {
            if (Module2["preRun"]) {
              if (typeof Module2["preRun"] == "function")
                Module2["preRun"] = [Module2["preRun"]];
              while (Module2["preRun"].length) {
                addOnPreRun(Module2["preRun"].shift());
              }
            }
            callRuntimeCallbacks(__ATPRERUN__);
          }
          function initRuntime() {
            runtimeInitialized = true;
            callRuntimeCallbacks(__ATINIT__);
          }
          function postRun() {
            if (Module2["postRun"]) {
              if (typeof Module2["postRun"] == "function")
                Module2["postRun"] = [Module2["postRun"]];
              while (Module2["postRun"].length) {
                addOnPostRun(Module2["postRun"].shift());
              }
            }
            callRuntimeCallbacks(__ATPOSTRUN__);
          }
          function addOnPreRun(cb) {
            __ATPRERUN__.unshift(cb);
          }
          function addOnInit(cb) {
            __ATINIT__.unshift(cb);
          }
          function addOnExit(cb) {
          }
          function addOnPostRun(cb) {
            __ATPOSTRUN__.unshift(cb);
          }
          var runDependencies = 0;
          var runDependencyWatcher = null;
          var dependenciesFulfilled = null;
          function getUniqueRunDependency(id) {
            return id;
          }
          function addRunDependency(id) {
            runDependencies++;
            Module2["monitorRunDependencies"]?.(runDependencies);
          }
          function removeRunDependency(id) {
            runDependencies--;
            Module2["monitorRunDependencies"]?.(runDependencies);
            if (runDependencies == 0) {
              if (runDependencyWatcher !== null) {
                clearInterval(runDependencyWatcher);
                runDependencyWatcher = null;
              }
              if (dependenciesFulfilled) {
                var callback = dependenciesFulfilled;
                dependenciesFulfilled = null;
                callback();
              }
            }
          }
          function abort(what) {
            Module2["onAbort"]?.(what);
            what = "Aborted(" + what + ")";
            err(what);
            ABORT = true;
            EXITSTATUS = 1;
            what += ". Build with -sASSERTIONS for more info.";
            var e = new WebAssembly.RuntimeError(what);
            readyPromiseReject(e);
            throw e;
          }
          var dataURIPrefix = "data:application/octet-stream;base64,";
          var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
          var isFileURI = (filename) => filename.startsWith("file://");
          var wasmBinaryFile;
          wasmBinaryFile = "data:application/octet-stream;base64,AGFzbQEAAAABHQZgAX8AYAABf2AAAGABfwF/YAJ/fwBgA39/fwF/Aw0MAgAEAgMBBQABAQADBAUBcAEBAQUGAQGAAoACBg4CfwFB8IuEBAt/AUEACweYAQoGbWVtb3J5AgARX193YXNtX2NhbGxfY3RvcnMAAAtIYXNoX1VwZGF0ZQABCkhhc2hfRmluYWwAAwlIYXNoX0luaXQABAxHZXRCdWZmZXJQdHIABRlfX2luZGlyZWN0X2Z1bmN0aW9uX3RhYmxlAQAJc3RhY2tTYXZlAAkMc3RhY2tSZXN0b3JlAAoKc3RhY2tBbGxvYwALCossDAIAC+4CAgV/AX5BACgCwAoiASABKQNAIgYgAK18NwNAAkACQAJAIAanQT9xIgINAEGACyEBIAAhAgwBC0HAACACayEDAkAgAEUNACADIAAgAyAASRshBCABIAJqIQVBACEBA0AgBSABIgFqQYALIAFqLQAAOgAAIAFBAWoiAiEBIAIgBEcNAAsLAkACQCAAIANJIgRFDQBBgAshASAAIQIMAQtBACgCwAoiAUHIAGogARACQYALIANqIQEgACADayECCyABIQEgAiECIAQNAQsgASEBAkACQCACIgJBwABPDQAgASEFIAIhAAwBCyACIQIgASEEA0BBACgCwApByABqIAQiBBACIAJBQGoiASECIARBwABqIgUhBCAFIQUgASEAIAFBP0sNAAsLIAUhBSAAIgBFDQBBACEBQQAhAgNAQQAoAsAKIAEiAWogBSABai0AADoAACACQQFqIgJB/wFxIgQhASACIQIgACAESw0ACwsLqCEBK38gACgCCCICIAAoAgQiAyAAKAIAIgRzcSADIARxcyAEQR53IARBE3dzIARBCndzaiAAKAIQIgVBGncgBUEVd3MgBUEHd3MgACgCHCIGaiAAKAIYIgcgACgCFCIIcyAFcSAHc2ogASgCACIJQRh0IAlBgP4DcUEIdHIgCUEIdkGA/gNxIAlBGHZyciIKakGY36iUBGoiC2oiCSAEcyADcSAJIARxcyAJQR53IAlBE3dzIAlBCndzaiAHIAEoAgQiDEEYdCAMQYD+A3FBCHRyIAxBCHZBgP4DcSAMQRh2cnIiDWogCyAAKAIMIg5qIg8gCCAFc3EgCHNqIA9BGncgD0EVd3MgD0EHd3NqQZGJ3YkHaiIQaiIMIAlzIARxIAwgCXFzIAxBHncgDEETd3MgDEEKd3NqIAggASgCCCILQRh0IAtBgP4DcUEIdHIgC0EIdkGA/gNxIAtBGHZyciIRaiAQIAJqIhIgDyAFc3EgBXNqIBJBGncgEkEVd3MgEkEHd3NqQc/3g657aiITaiILIAxzIAlxIAsgDHFzIAtBHncgC0ETd3MgC0EKd3NqIAUgASgCDCIQQRh0IBBBgP4DcUEIdHIgEEEIdkGA/gNxIBBBGHZyciIUaiATIANqIhMgEiAPc3EgD3NqIBNBGncgE0EVd3MgE0EHd3NqQaW3181+aiIVaiIQIAtzIAxxIBAgC3FzIBBBHncgEEETd3MgEEEKd3NqIA8gASgCECIWQRh0IBZBgP4DcUEIdHIgFkEIdkGA/gNxIBZBGHZyciIXaiAVIARqIhYgEyASc3EgEnNqIBZBGncgFkEVd3MgFkEHd3NqQduE28oDaiIYaiIPIBBzIAtxIA8gEHFzIA9BHncgD0ETd3MgD0EKd3NqIAEoAhQiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiGSASaiAYIAlqIhIgFiATc3EgE3NqIBJBGncgEkEVd3MgEkEHd3NqQfGjxM8FaiIYaiIJIA9zIBBxIAkgD3FzIAlBHncgCUETd3MgCUEKd3NqIAEoAhgiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiGiATaiAYIAxqIhMgEiAWc3EgFnNqIBNBGncgE0EVd3MgE0EHd3NqQaSF/pF5aiIYaiIMIAlzIA9xIAwgCXFzIAxBHncgDEETd3MgDEEKd3NqIAEoAhwiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiGyAWaiAYIAtqIhYgEyASc3EgEnNqIBZBGncgFkEVd3MgFkEHd3NqQdW98dh6aiIYaiILIAxzIAlxIAsgDHFzIAtBHncgC0ETd3MgC0EKd3NqIAEoAiAiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiHCASaiAYIBBqIhIgFiATc3EgE3NqIBJBGncgEkEVd3MgEkEHd3NqQZjVnsB9aiIYaiIQIAtzIAxxIBAgC3FzIBBBHncgEEETd3MgEEEKd3NqIAEoAiQiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiHSATaiAYIA9qIhMgEiAWc3EgFnNqIBNBGncgE0EVd3MgE0EHd3NqQYG2jZQBaiIYaiIPIBBzIAtxIA8gEHFzIA9BHncgD0ETd3MgD0EKd3NqIAEoAigiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiHiAWaiAYIAlqIhYgEyASc3EgEnNqIBZBGncgFkEVd3MgFkEHd3NqQb6LxqECaiIYaiIJIA9zIBBxIAkgD3FzIAlBHncgCUETd3MgCUEKd3NqIAEoAiwiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiHyASaiAYIAxqIhIgFiATc3EgE3NqIBJBGncgEkEVd3MgEkEHd3NqQcP7sagFaiIYaiIMIAlzIA9xIAwgCXFzIAxBHncgDEETd3MgDEEKd3NqIAEoAjAiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiICATaiAYIAtqIhMgEiAWc3EgFnNqIBNBGncgE0EVd3MgE0EHd3NqQfS6+ZUHaiIYaiILIAxzIAlxIAsgDHFzIAtBHncgC0ETd3MgC0EKd3NqIAEoAjQiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiISAWaiAYIBBqIhAgEyASc3EgEnNqIBBBGncgEEEVd3MgEEEHd3NqQf7j+oZ4aiIYaiIWIAtzIAxxIBYgC3FzIBZBHncgFkETd3MgFkEKd3NqIAEoAjgiFUEYdCAVQYD+A3FBCHRyIBVBCHZBgP4DcSAVQRh2cnIiIiASaiAYIA9qIg8gECATc3EgE3NqIA9BGncgD0EVd3MgD0EHd3NqQaeN8N55aiIVaiISIBZzIAtxIBIgFnFzIBJBHncgEkETd3MgEkEKd3NqIAEoAjwiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnIiIyATaiAVIAlqIgEgDyAQc3EgEHNqIAFBGncgAUEVd3MgAUEHd3NqQfTi74x8aiIJaiEVIBIhGCAWISQgCyElIAkgDGohJiABIScgDyEoIBAhKSAjISMgIiEiICEhISAgISAgHyEfIB4hHiAdIR0gHCEcIBshGyAaIRogGSEZIBchFyAUIRQgESERIA0hECAKIQxBgAkhAUEQISoDQCAVIgkgGCIKcyAkIitxIAkgCnFzIAlBHncgCUETd3MgCUEKd3NqIBAiEEEZdyAQQQ53cyAQQQN2cyAMaiAdIh1qICIiFkEPdyAWQQ13cyAWQQp2c2oiDCApaiAmIhIgJyIPICgiE3NxIBNzaiASQRp3IBJBFXdzIBJBB3dzaiABIgEoAgBqIiRqIgsgCXMgCnEgCyAJcXMgC0EedyALQRN3cyALQQp3c2ogESIYQRl3IBhBDndzIBhBA3ZzIBBqIB4iHmogIyIVQQ93IBVBDXdzIBVBCnZzaiINIBNqIAEoAgRqICQgJWoiEyASIA9zcSAPc2ogE0EadyATQRV3cyATQQd3c2oiJWoiECALcyAJcSAQIAtxcyAQQR53IBBBE3dzIBBBCndzaiAUIiRBGXcgJEEOd3MgJEEDdnMgGGogHyIfaiAMQQ93IAxBDXdzIAxBCnZzaiIRIA9qIAEoAghqICUgK2oiGCATIBJzcSASc2ogGEEadyAYQRV3cyAYQQd3c2oiJWoiDyAQcyALcSAPIBBxcyAPQR53IA9BE3dzIA9BCndzaiAXIhdBGXcgF0EOd3MgF0EDdnMgJGogICIgaiANQQ93IA1BDXdzIA1BCnZzaiIUIBJqIAEoAgxqICUgCmoiCiAYIBNzcSATc2ogCkEadyAKQRV3cyAKQQd3c2oiJWoiEiAPcyAQcSASIA9xcyASQR53IBJBE3dzIBJBCndzaiATIBkiJEEZdyAkQQ53cyAkQQN2cyAXaiAhIiFqIBFBD3cgEUENd3MgEUEKdnNqIhdqIAEoAhBqICUgCWoiEyAKIBhzcSAYc2ogE0EadyATQRV3cyATQQd3c2oiJWoiCSAScyAPcSAJIBJxcyAJQR53IAlBE3dzIAlBCndzaiABKAIUIBoiGkEZdyAaQQ53cyAaQQN2cyAkaiAWaiAUQQ93IBRBDXdzIBRBCnZzaiIZaiAYaiAlIAtqIhggEyAKc3EgCnNqIBhBGncgGEEVd3MgGEEHd3NqIiVqIgsgCXMgEnEgCyAJcXMgC0EedyALQRN3cyALQQp3c2ogASgCGCAbIiRBGXcgJEEOd3MgJEEDdnMgGmogFWogF0EPdyAXQQ13cyAXQQp2c2oiGmogCmogJSAQaiIKIBggE3NxIBNzaiAKQRp3IApBFXdzIApBB3dzaiIlaiIQIAtzIAlxIBAgC3FzIBBBHncgEEETd3MgEEEKd3NqIAEoAhwgHCIcQRl3IBxBDndzIBxBA3ZzICRqIAxqIBlBD3cgGUENd3MgGUEKdnNqIhtqIBNqICUgD2oiJCAKIBhzcSAYc2ogJEEadyAkQRV3cyAkQQd3c2oiE2oiDyAQcyALcSAPIBBxcyAPQR53IA9BE3dzIA9BCndzaiABKAIgIB1BGXcgHUEOd3MgHUEDdnMgHGogDWogGkEPdyAaQQ13cyAaQQp2c2oiHGogGGogEyASaiIYICQgCnNxIApzaiAYQRp3IBhBFXdzIBhBB3dzaiITaiISIA9zIBBxIBIgD3FzIBJBHncgEkETd3MgEkEKd3NqIAEoAiQgHkEZdyAeQQ53cyAeQQN2cyAdaiARaiAbQQ93IBtBDXdzIBtBCnZzaiIdaiAKaiATIAlqIgkgGCAkc3EgJHNqIAlBGncgCUEVd3MgCUEHd3NqIgpqIhMgEnMgD3EgEyAScXMgE0EedyATQRN3cyATQQp3c2ogASgCKCAfQRl3IB9BDndzIB9BA3ZzIB5qIBRqIBxBD3cgHEENd3MgHEEKdnNqIh5qICRqIAogC2oiCiAJIBhzcSAYc2ogCkEadyAKQRV3cyAKQQd3c2oiJGoiCyATcyAScSALIBNxcyALQR53IAtBE3dzIAtBCndzaiABKAIsICBBGXcgIEEOd3MgIEEDdnMgH2ogF2ogHUEPdyAdQQ13cyAdQQp2c2oiH2ogGGogJCAQaiIYIAogCXNxIAlzaiAYQRp3IBhBFXdzIBhBB3dzaiIkaiIQIAtzIBNxIBAgC3FzIBBBHncgEEETd3MgEEEKd3NqIAEoAjAgIUEZdyAhQQ53cyAhQQN2cyAgaiAZaiAeQQ93IB5BDXdzIB5BCnZzaiIgaiAJaiAkIA9qIiQgGCAKc3EgCnNqICRBGncgJEEVd3MgJEEHd3NqIg9qIgkgEHMgC3EgCSAQcXMgCUEedyAJQRN3cyAJQQp3c2ogASgCNCAWQRl3IBZBDndzIBZBA3ZzICFqIBpqIB9BD3cgH0ENd3MgH0EKdnNqIiFqIApqIA8gEmoiDyAkIBhzcSAYc2ogD0EadyAPQRV3cyAPQQd3c2oiCmoiEiAJcyAQcSASIAlxcyASQR53IBJBE3dzIBJBCndzaiABKAI4IBVBGXcgFUEOd3MgFUEDdnMgFmogG2ogIEEPdyAgQQ13cyAgQQp2c2oiImogGGogCiATaiITIA8gJHNxICRzaiATQRp3IBNBFXdzIBNBB3dzaiIYaiIWIBJzIAlxIBYgEnFzIBZBHncgFkETd3MgFkEKd3NqIAEoAjwgDEEZdyAMQQ53cyAMQQN2cyAVaiAcaiAhQQ93ICFBDXdzICFBCnZzaiIKaiAkaiAYIAtqIgsgEyAPc3EgD3NqIAtBGncgC0EVd3MgC0EHd3NqIiZqIishFSAWIRggEiEkIAkhJSAmIBBqIiwhJiALIScgEyEoIA8hKSAKISMgIiEiICEhISAgISAgHyEfIB4hHiAdIR0gHCEcIBshGyAaIRogGSEZIBchFyAUIRQgESERIA0hECAMIQwgAUHAAGohASAqIgpBEGohKiAKQTBJDQALIAAgDyAGajYCHCAAIBMgB2o2AhggACALIAhqNgIUIAAgLCAFajYCECAAIAkgDmo2AgwgACASIAJqNgIIIAAgFiADajYCBCAAICsgBGo2AgAL1AMDBX8BfgF7QQAoAsAKIgAgACgCQCIBQQJ2QQ9xIgJBAnRqIgMgAygCAEF/IAFBA3QiAXRBf3NxQYABIAF0czYCAAJAAkAgAkEOTw0AIAJBAWohAAwBCwJAIAJBDkcNACAAQQA2AjwLIABByABqIAAQAkEAIQALAkAgACIAQQ1LDQBBACgCwAogAEECdCIAakEAQTggAGsQBhoLQQAoAsAKIgAgACkDQCIFpyICQRt0IAJBC3RBgID8B3FyIAJBBXZBgP4DcSACQQN0QRh2cnI2AjwgACAFQh2IpyICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZycjYCOCAAQcgAaiAAEAJBACgCwApBPGohAUEAIQADQCABQQcgACIAa0ECdGoiAiAC/QACACAG/Q0MDQ4PCAkKCwQFBgcAAQIDIAb9DQMCAQAHBgUECwoJCA8ODQwgBv0NDA0ODwgJCgsEBQYHAAECA/0LAgAgAEEEaiICIQAgAkEIRw0ACwJAQQAoAsAKIgMoAmhFDQAgA0HIAGohBEEAIQBBACECA0BBgAsgACIAaiAEIABqLQAAOgAAIAJBAWoiAkH/AXEiASEAIAIhAiADKAJoIAFLDQALCwtxAQJ/QQAoAsAKIgFCADcDQCABQcgAaiECAkAgAEHgAUcNACABQRw2AmggAkEQakEA/QAEsAj9CwIAIAJBAP0ABKAI/QsCAEEADwsgAUEgNgJoIAJBEGpBAP0ABJAI/QsCACACQQD9AASACP0LAgBBAAsFAEGACwvyAgIDfwF+AkAgAkUNACAAIAE6AAAgACACaiIDQX9qIAE6AAAgAkEDSQ0AIAAgAToAAiAAIAE6AAEgA0F9aiABOgAAIANBfmogAToAACACQQdJDQAgACABOgADIANBfGogAToAACACQQlJDQAgAEEAIABrQQNxIgRqIgMgAUH/AXFBgYKECGwiATYCACADIAIgBGtBfHEiBGoiAkF8aiABNgIAIARBCUkNACADIAE2AgggAyABNgIEIAJBeGogATYCACACQXRqIAE2AgAgBEEZSQ0AIAMgATYCGCADIAE2AhQgAyABNgIQIAMgATYCDCACQXBqIAE2AgAgAkFsaiABNgIAIAJBaGogATYCACACQWRqIAE2AgAgBCADQQRxQRhyIgVrIgJBIEkNACABrUKBgICAEH4hBiADIAVqIQEDQCABIAY3AxggASAGNwMQIAEgBjcDCCABIAY3AwAgAUEgaiEBIAJBYGoiAkEfSw0ACwsgAAsGACAAJAELBAAjAQsEACMACwYAIAAkAAsSAQJ/IwAgAGtBcHEiASQAIAELC9ICAgBBgAgLwAJn5glqha5nu3Lzbjw69U+lf1IOUYxoBZur2YMfGc3gW9ieBcEH1Xw2F91wMDlZDvcxC8D/ERVYaKeP+WSkT/q+mC+KQpFEN3HP+8C1pdu16VvCVjnxEfFZpII/ktVeHKuYqgfYAVuDEr6FMSTDfQxVdF2+cv6x3oCnBtybdPGbwcFpm+SGR77vxp3BD8yhDCRvLOktqoR0StypsFzaiPl2UlE+mG3GMajIJwOwx39Zv/ML4MZHkafVUWPKBmcpKRSFCrcnOCEbLvxtLE0TDThTVHMKZbsKanYuycKBhSxykqHov6JLZhqocItLwqNRbMcZ6JLRJAaZ1oU1DvRwoGoQFsGkGQhsNx5Md0gntbywNLMMHDlKqthOT8qcW/NvLmjugo90b2OleBR4yIQIAseM+v++kOtsUKT3o/m+8nhxxgBBwAoLBIAFgAA=";
          if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
          }
          function getBinarySync(file) {
            if (file == wasmBinaryFile && wasmBinary) {
              return new Uint8Array(wasmBinary);
            }
            var binary = tryParseAsDataURI(file);
            if (binary) {
              return binary;
            }
            if (readBinary) {
              return readBinary(file);
            }
            throw "both async and sync fetching of the wasm failed";
          }
          function getBinaryPromise(binaryFile) {
            return Promise.resolve().then(() => getBinarySync(binaryFile));
          }
          function instantiateArrayBuffer(binaryFile, imports, receiver) {
            return getBinaryPromise(binaryFile).then((binary) => {
              return WebAssembly.instantiate(binary, imports);
            }).then(receiver, (reason) => {
              err(`failed to asynchronously prepare wasm: ${reason}`);
              abort(reason);
            });
          }
          function instantiateAsync(binary, binaryFile, imports, callback) {
            return instantiateArrayBuffer(binaryFile, imports, callback);
          }
          function createWasm() {
            var info = {
              "env": wasmImports,
              "wasi_snapshot_preview1": wasmImports
            };
            function receiveInstance(instance, module) {
              wasmExports = instance.exports;
              wasmMemory3 = wasmExports["memory"];
              updateMemoryViews();
              addOnInit(wasmExports["__wasm_call_ctors"]);
              removeRunDependency("wasm-instantiate");
              return wasmExports;
            }
            addRunDependency("wasm-instantiate");
            function receiveInstantiationResult(result) {
              receiveInstance(result["instance"]);
            }
            if (Module2["instantiateWasm"]) {
              try {
                return Module2["instantiateWasm"](info, receiveInstance);
              } catch (e) {
                err(`Module.instantiateWasm callback failed with error: ${e}`);
                readyPromiseReject(e);
              }
            }
            instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
            return {};
          }
          var tempDouble;
          var tempI64;
          function ExitStatus(status) {
            this.name = "ExitStatus";
            this.message = `Program terminated with exit(${status})`;
            this.status = status;
          }
          var callRuntimeCallbacks = (callbacks) => {
            while (callbacks.length > 0) {
              callbacks.shift()(Module2);
            }
          };
          function getValue(ptr, type = "i8") {
            if (type.endsWith("*"))
              type = "*";
            switch (type) {
              case "i1":
                return HEAP8[ptr];
              case "i8":
                return HEAP8[ptr];
              case "i16":
                return HEAP16[ptr >> 1];
              case "i32":
                return HEAP32[ptr >> 2];
              case "i64":
                abort("to do getValue(i64) use WASM_BIGINT");
              case "float":
                return HEAPF32[ptr >> 2];
              case "double":
                return HEAPF64[ptr >> 3];
              case "*":
                return HEAPU32[ptr >> 2];
              default:
                abort(`invalid type for getValue: ${type}`);
            }
          }
          var noExitRuntime = Module2["noExitRuntime"] || true;
          function setValue(ptr, value, type = "i8") {
            if (type.endsWith("*"))
              type = "*";
            switch (type) {
              case "i1":
                HEAP8[ptr] = value;
                break;
              case "i8":
                HEAP8[ptr] = value;
                break;
              case "i16":
                HEAP16[ptr >> 1] = value;
                break;
              case "i32":
                HEAP32[ptr >> 2] = value;
                break;
              case "i64":
                abort("to do setValue(i64) use WASM_BIGINT");
              case "float":
                HEAPF32[ptr >> 2] = value;
                break;
              case "double":
                HEAPF64[ptr >> 3] = value;
                break;
              case "*":
                HEAPU32[ptr >> 2] = value;
                break;
              default:
                abort(`invalid type for setValue: ${type}`);
            }
          }
          var wasmImports = {};
          var wasmExports = createWasm();
          var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["__wasm_call_ctors"])();
          var _Hash_Update = Module2["_Hash_Update"] = (a0) => (_Hash_Update = Module2["_Hash_Update"] = wasmExports["Hash_Update"])(a0);
          var _Hash_Final = Module2["_Hash_Final"] = () => (_Hash_Final = Module2["_Hash_Final"] = wasmExports["Hash_Final"])();
          var _Hash_Init = Module2["_Hash_Init"] = (a0) => (_Hash_Init = Module2["_Hash_Init"] = wasmExports["Hash_Init"])(a0);
          var _GetBufferPtr = Module2["_GetBufferPtr"] = () => (_GetBufferPtr = Module2["_GetBufferPtr"] = wasmExports["GetBufferPtr"])();
          var stackSave = () => (stackSave = wasmExports["stackSave"])();
          var stackRestore = (a0) => (stackRestore = wasmExports["stackRestore"])(a0);
          var stackAlloc = (a0) => (stackAlloc = wasmExports["stackAlloc"])(a0);
          var calledRun;
          dependenciesFulfilled = function runCaller() {
            if (!calledRun)
              run();
            if (!calledRun)
              dependenciesFulfilled = runCaller;
          };
          function run() {
            if (runDependencies > 0) {
              return;
            }
            preRun();
            if (runDependencies > 0) {
              return;
            }
            function doRun() {
              if (calledRun)
                return;
              calledRun = true;
              Module2["calledRun"] = true;
              if (ABORT)
                return;
              initRuntime();
              readyPromiseResolve(Module2);
              if (Module2["onRuntimeInitialized"])
                Module2["onRuntimeInitialized"]();
              postRun();
            }
            if (Module2["setStatus"]) {
              Module2["setStatus"]("Running...");
              setTimeout(function() {
                setTimeout(function() {
                  Module2["setStatus"]("");
                }, 1);
                doRun();
              }, 1);
            } else {
              doRun();
            }
          }
          if (Module2["preInit"]) {
            if (typeof Module2["preInit"] == "function")
              Module2["preInit"] = [Module2["preInit"]];
            while (Module2["preInit"].length > 0) {
              Module2["preInit"].pop()();
            }
          }
          run();
          return moduleArg.ready;
        };
      })();
      sha256_default = Module;
    }
  });

  // node_modules/@huggingface/hub/dist/browser/sha256-node-TNZ2WHTI.mjs
  var sha256_node_TNZ2WHTI_exports = {};
  var init_sha256_node_TNZ2WHTI = __esm({
    "node_modules/@huggingface/hub/dist/browser/sha256-node-TNZ2WHTI.mjs"() {
    }
  });

  // node_modules/@huggingface/hub/dist/browser/FileBlob-7MRLQ6TG.mjs
  var FileBlob_7MRLQ6TG_exports = {};
  var init_FileBlob_7MRLQ6TG = __esm({
    "node_modules/@huggingface/hub/dist/browser/FileBlob-7MRLQ6TG.mjs"() {
    }
  });

  // node_modules/@huggingface/hub/dist/browser/sub-paths-F6TP7MGR.mjs
  var sub_paths_F6TP7MGR_exports = {};
  var init_sub_paths_F6TP7MGR = __esm({
    "node_modules/@huggingface/hub/dist/browser/sub-paths-F6TP7MGR.mjs"() {
    }
  });

  // node_modules/@huggingface/hub/dist/browser/index.mjs
  var browser_exports = {};
  __export(browser_exports, {
    DATASET_EXPANDABLE_KEYS: () => DATASET_EXPANDABLE_KEYS,
    DATASET_EXPAND_KEYS: () => DATASET_EXPAND_KEYS,
    DIFFUSERS_SAFETENSORS_FILE: () => DIFFUSERS_SAFETENSORS_FILE,
    DIFFUSERS_SAFETENSORS_INDEX_FILE: () => DIFFUSERS_SAFETENSORS_INDEX_FILE,
    DIFFUSERS_WEIGHTS_SUBFOLDERS: () => DIFFUSERS_WEIGHTS_SUBFOLDERS,
    HUB_URL: () => HUB_URL,
    HubApiError: () => HubApiError,
    InvalidApiResponseFormatError: () => InvalidApiResponseFormatError,
    JsonStreamParseError: () => JsonStreamParseError,
    MODEL_DERIVED_FIELD_TO_API_KEY: () => MODEL_DERIVED_FIELD_TO_API_KEY,
    MODEL_EXPANDABLE_KEYS: () => MODEL_EXPANDABLE_KEYS,
    MODEL_EXPAND_KEYS: () => MODEL_EXPAND_KEYS,
    RE_SAFETENSORS_FILE: () => RE_SAFETENSORS_FILE,
    RE_SAFETENSORS_INDEX_FILE: () => RE_SAFETENSORS_INDEX_FILE,
    RE_SAFETENSORS_SHARD_FILE: () => RE_SAFETENSORS_SHARD_FILE,
    SAFETENSORS_FILE: () => SAFETENSORS_FILE,
    SAFETENSORS_INDEX_FILE: () => SAFETENSORS_INDEX_FILE,
    SPACE_EXPANDABLE_KEYS: () => SPACE_EXPANDABLE_KEYS,
    SPACE_EXPAND_KEYS: () => SPACE_EXPAND_KEYS,
    SafetensorParseError: () => SafetensorParseError,
    __internal_XetBlob: () => XetBlob,
    __internal_sha256: () => sha256,
    assertSafeShardFilename: () => assertSafeShardFilename,
    cancelJob: () => cancelJob,
    checkRepoAccess: () => checkRepoAccess,
    commit: () => commit,
    commitIter: () => commitIter,
    commitIterBucket: () => commitIterBucket,
    computeNumOfParamsByDtypeSingleFile: () => computeNumOfParamsByDtypeSingleFile,
    copyFile: () => copyFile,
    copyFileIter: () => copyFileIter,
    copyFiles: () => copyFiles,
    copyFilesIter: () => copyFilesIter,
    copyFolder: () => copyFolder,
    copyFolderIter: () => copyFolderIter,
    countCommits: () => countCommits,
    createBranch: () => createBranch,
    createCollection: () => createCollection,
    createRepo: () => createRepo,
    createScheduledJob: () => createScheduledJob,
    datasetInfo: () => datasetInfo,
    deleteBranch: () => deleteBranch,
    deleteCollection: () => deleteCollection,
    deleteFile: () => deleteFile,
    deleteFiles: () => deleteFiles,
    deleteRepo: () => deleteRepo,
    deleteScheduledJob: () => deleteScheduledJob,
    downloadFile: () => downloadFile,
    duplicateJob: () => duplicateJob,
    encodeShardFilename: () => encodeShardFilename,
    fileDownloadInfo: () => fileDownloadInfo,
    fileExists: () => fileExists,
    getJob: () => getJob,
    getQuantizationMultiplier: () => getQuantizationMultiplier,
    getScheduledJob: () => getScheduledJob,
    globMatch: () => globMatch,
    isQuantizedTensor: () => isQuantizedTensor,
    listCollections: () => listCollections,
    listCommits: () => listCommits,
    listDatasets: () => listDatasets,
    listFiles: () => listFiles,
    listJobHardware: () => listJobHardware,
    listJobs: () => listJobs,
    listModels: () => listModels,
    listScheduledJobs: () => listScheduledJobs,
    listSpaces: () => listSpaces,
    matchesCompressedTensorsTarget: () => matchesCompressedTensorsTarget,
    modelInfo: () => modelInfo,
    oauthHandleRedirect: () => oauthHandleRedirect,
    oauthHandleRedirectIfPresent: () => oauthHandleRedirectIfPresent,
    oauthLoginUrl: () => oauthLoginUrl,
    parseSafetensorsMetadata: () => parseSafetensorsMetadata,
    parseSafetensorsShardFilename: () => parseSafetensorsShardFilename,
    parseTotalParameters: () => parseTotalParameters,
    pathsInfo: () => pathsInfo,
    relativeUnderFolder: () => relativeUnderFolder,
    repoExists: () => repoExists,
    resumeScheduledJob: () => resumeScheduledJob,
    runJob: () => runJob,
    runScheduledJob: () => runScheduledJob,
    spaceInfo: () => spaceInfo,
    streamJobEvents: () => streamJobEvents,
    streamJobLogs: () => streamJobLogs,
    streamJobMetrics: () => streamJobMetrics,
    streamJson: () => streamJson,
    suspendScheduledJob: () => suspendScheduledJob,
    uploadFile: () => uploadFile,
    uploadFiles: () => uploadFiles,
    uploadFilesWithProgress: () => uploadFilesWithProgress,
    validateTensorEntry: () => validateTensorEntry,
    whoAmI: () => whoAmI
  });

  // node_modules/gearhash-jit/dist/esm/table.js
  var GEAR_TABLE = [
    0xb088d3a9e840f559n,
    0x5652c7f739ed20d6n,
    0x45b28969898972abn,
    0x6b0a89d5b68ec777n,
    0x368f573e8b7a31b7n,
    0x1dc636dce936d94bn,
    0x207a4c4e5554d5b6n,
    0xa474b34628239acbn,
    0x3b06a83e1ca3b912n,
    0x90e78d6c2f02baf7n,
    0xe1c92df7150d9a8an,
    0x8e95053a1086d3adn,
    0x5a2ef4f1b83a0722n,
    0xa50fac949f807faen,
    0x0e7303eb80d8d681n,
    0x99b07edc1570ad0fn,
    0x689d2fb555fd3076n,
    0x00005082119ea468n,
    0xc4b08306a88fcc28n,
    0x3eb0678af6374afdn,
    0xf19f87ab86ad7436n,
    0xf2129fbfbe6bc736n,
    0x481149575c98a4edn,
    0x0000010695477bc5n,
    0x1fba37801a9ceaccn,
    0x3bf06fd663a49b6dn,
    0x99687e9782e3874bn,
    0x79a10673aa50d8e3n,
    0xe4accf9e6211f420n,
    0x2520e71f87579071n,
    0x2bd5d3fd781a8a9bn,
    0x00de4dcddd11c873n,
    0xeaa9311c5a87392fn,
    0xdb748eb617bc40ffn,
    0xaf579a8df620bf6fn,
    0x86a6e5da1b09c2b1n,
    0xcc2fc30ac322a12en,
    0x355e2afec1f74267n,
    0x2d99c8f4c021a47bn,
    0xbade4b4a9404cfc3n,
    0xf7b518721d707d69n,
    0x3286b6587bf32c20n,
    0x0000b68886af270cn,
    0xa115d6e4db8a9079n,
    0x484f7e9c97b2e199n,
    0xccca7bb75713e301n,
    0xbf2584a62bb0f160n,
    0xade7e813625dbcc8n,
    0x000070940d87955an,
    0x8ae69108139e626fn,
    0xbd776ad72fde38a2n,
    0xfb6b001fc2fcc0cfn,
    0xc7a474b8e67bc427n,
    0xbaf6f11610eb5d58n,
    0x09cb1f5b6de770d1n,
    0xb0b219e6977d4c47n,
    0x00ccbc386ea7ad4an,
    0xcc849d0adf973f01n,
    0x73a3ef7d016af770n,
    0xc807d2d386bdbdfen,
    0x7f2ac9966c791730n,
    0xd037a86bc6c504dan,
    0xf3f17c661eaa609dn,
    0xaca626b04daae687n,
    0x755a99374f4a5b07n,
    0x90837ee65b2caeden,
    0x6ee8ad93fd560785n,
    0x0000d9e11053edd8n,
    0x9e063bb2d21cdbd7n,
    0x07ab77f12a01d2b2n,
    0xec550255e6641b44n,
    0x78fb94a8449c14c6n,
    0xc7510e1bc6c0f5f5n,
    0x0000320b36e4cae3n,
    0x827c33262c8b1a2dn,
    0x14675f0b48ea4144n,
    0x267bd3a6498decebn,
    0xf1916ff982f5035en,
    0x86221b7ff434fb88n,
    0x9dbecee7386f49d8n,
    0xea58f8cac80f8f4an,
    0x008d198692fc64d8n,
    0x6d38704fbabf9a36n,
    0xe032cb07d1e7be4cn,
    0x228d21f6ad450890n,
    0x635cb1bfc02589a5n,
    0x4620a1739ca2ce71n,
    0xa7e7dfe3aae5fb58n,
    0x0c10ca932b3c0debn,
    0x2727fee884afed7bn,
    0xa2df1c6df9e2ab1fn,
    0x4dcdd1ac0774f523n,
    0x000070ffad33e24en,
    0xa2ace87bc5977816n,
    0x9892275ab4286049n,
    0xc2861181ddf18959n,
    0xbb9972a042483e19n,
    0xef70cd3766513078n,
    0x00000513abfc9864n,
    0xc058b61858c94083n,
    0x09e850859725e0den,
    0x9197fb3bf83e7d94n,
    0x7e1e626d12b64bcen,
    0x520c54507f7b57d1n,
    0xbee1797174e22416n,
    0x6fd9ac3222e95587n,
    0x0023957c9adfbf3en,
    0xa01c7d7e234bbe15n,
    0xaba2c758b8a38cbbn,
    0x0d1fa0ceec3e2b30n,
    0x0bb6a58b7e60b991n,
    0x4333dd5b9fa26635n,
    0xc2fd3b7d4001c1a3n,
    0xfb41802454731127n,
    0x65a56185a50d18cbn,
    0xf67a02bd8784b54fn,
    0x696f11dd67e65063n,
    0x00002022fca814abn,
    0x8cd6be912db9d852n,
    0x695189b6e9ae8a57n,
    0xee9453b50ada0c28n,
    0xd8fc5ea91a78845en,
    0xab86bf191a4aa767n,
    0x0000c6b5c86415e5n,
    0x267310178e08a22en,
    0xed2d101b078bca25n,
    0x3b41ed84b226a8fbn,
    0x13e622120f28dc06n,
    0xa315f5ebfb706d26n,
    0x8816c34e3301bacen,
    0xe9395b9cbb71fdaen,
    0x002ce9202e721648n,
    0x4283db1d2bb3c91cn,
    0xd77d461ad2b1a6a5n,
    0xe2ec17e46eeb866bn,
    0xb8e0be4039fbc47cn,
    0xdea160c4d5299d04n,
    0x7eec86c8d28c3634n,
    0x2119ad129f98a399n,
    0xa6ccf46b61a283efn,
    0x2c52cedef658c617n,
    0x2db4871169acdd83n,
    0x0000f0d6f39ecbe9n,
    0x3dd5d8c98d2f9489n,
    0x8a1872a22b01f584n,
    0xf282a4c40e7b3cf2n,
    0x8020ec2ccb1ba196n,
    0x6693b6e09e59e313n,
    0x0000ce19cc7c83ebn,
    0x20cb5735f6479c3bn,
    0x762ebf3759d75a5bn,
    0x207bfe823d693975n,
    0xd77dc112339cd9d5n,
    0x9ba7834284627d03n,
    0x217dc513e95f51e9n,
    0xb27b1a29fc5e7816n,
    0x00d5cd9831bb662dn,
    0x71e39b806d75734cn,
    0x7e572af006fb1a23n,
    0xa2734f2f6ae91f85n,
    0xbf82c6b5022cddf2n,
    0x5c3beac60761a0den,
    0xcdc893bb47416998n,
    0x6d1085615c187e01n,
    0x77f8ae30ac277c5dn,
    0x917c6b81122a2c91n,
    0x5b75b699add16967n,
    0x0000cf6ae79a069bn,
    0xf3c40afa60de1104n,
    0x2063127aa59167c3n,
    0x621de62269d1894dn,
    0xd188ac1de62b4726n,
    0x107036e2154b673cn,
    0x0000b85f28553a1dn,
    0xf2ef4e4c18236f3dn,
    0xd9d6de6611b9f602n,
    0xa1fc7955fb47911cn,
    0xeb85fd032f298dbdn,
    0xbe27502fb3befae1n,
    0xe3034251c4cd661en,
    0x441364d354071836n,
    0x0082b36c75f2983en,
    0xb145910316fa66f0n,
    0x021c069c9847caf7n,
    0x2910dfc75a4b5221n,
    0x735b353e1c57a8b5n,
    0xce44312ce98ed96cn,
    0xbc942e4506bdfa65n,
    0xf05086a71257941bn,
    0xfec3b215d351ceadn,
    0x00ae1055e0144202n,
    0xf54b40846f42e454n,
    0x00007fd9c8bcbcc8n,
    0xbfbd9ef317de9bfen,
    0xa804302ff2854e12n,
    0x39ce4957a5e5d8d4n,
    0xffb9e2a45637ba84n,
    0x55b9ad1d9ea0818bn,
    0x00008acbf319178an,
    0x48e2bfc8d0fbfb38n,
    0x8be39841e848b5e8n,
    0x0e2712160696a08bn,
    0xd51096e84b44242an,
    0x1101ba176792e13an,
    0xc22e770f4531689dn,
    0x1689eff272bbc56cn,
    0x00a92a197f5650ecn,
    0xbc765990bda1784en,
    0xc61441e392fcb8aen,
    0x07e13a2ced31e4a0n,
    0x92cbe984234e9d4dn,
    0x8f4ff572bb7d8ac5n,
    0x0b9670c00b963bd0n,
    0x62955a581a03eb01n,
    0x645f83e5ea000254n,
    0x41fce516cd88f299n,
    0xbbda9748da7a98cfn,
    0x0000aab2fe4845fan,
    0x19761b069bf56555n,
    0x8b8f5e8343b6ad56n,
    0x3e5d1cfd144821d9n,
    0xec5c1e2ca2b0cd8fn,
    0xfaf7e0fea7fbb57fn,
    0x000000d3ba12961bn,
    0xda3f90178401b18en,
    0x70ff906de33a5febn,
    0x0527d5a7c06970e7n,
    0x22d8e773607c13e9n,
    0xc9ab70df643c3bacn,
    0xeda4c6dc8abe12e3n,
    0xecef1f410033e78an,
    0x0024c2b274ac72cbn,
    0x06740d954fa900b4n,
    0x1d7a299b323d6304n,
    0xb3c37cb298cbead5n,
    0xc986e3c76178739bn,
    0x9fabea364b46f58an,
    0x6da214c5af85cc56n,
    0x17a43ed8b7a38f84n,
    0x6eccec511d9adbebn,
    0xf9cab30913335afbn,
    0x4a5e60c5f415eed2n,
    0x00006967503672b4n,
    0x9da51d121454bb87n,
    0x84321e13b9bbc816n,
    0xfb3d6fb6ab2fdd8dn,
    0x60305eed8e160a8dn,
    0xcbbf4b14e9946ce8n,
    0x00004f63381b10c3n,
    0x07d5b7816fcc4e10n,
    0xe5a536726a6a8155n,
    0x57afb23447a07fddn,
    0x18f346f7abc9d394n,
    0x636dc655d61ad33dn,
    0xcc8bab4939f7f3f6n,
    0x63c7a906c1dd187bn
  ];

  // node_modules/gearhash-jit/dist/esm/wasm.js
  var TABLE_OFFSET = 0;
  var HASH_OFFSET = 2048;
  var MASK_OFFSET = 2056;
  var INPUT_OFFSET = 4096;
  var PAGES = 8;
  var MAX_INPUT_SIZE = PAGES * 65536 - INPUT_OFFSET;
  var wasmMemory = null;
  var wasmView = null;
  var wasmFn = null;
  function toSignedLeb128(n) {
    const bytes = [];
    let value = n | 0;
    for (; ; ) {
      const byte = value & 127;
      value >>= 7;
      if (value === 0 && (byte & 64) === 0 || value === -1 && (byte & 64) !== 0) {
        bytes.push(byte);
        return bytes;
      }
      bytes.push(byte | 128);
    }
  }
  function toLebU32Padded5(n) {
    return [
      n & 127 | 128,
      n >>> 7 & 127 | 128,
      n >>> 14 & 127 | 128,
      n >>> 21 & 127 | 128,
      n >>> 28 & 15
    ];
  }
  function generateWasmBytes() {
    const code = [];
    function emit(...bytes) {
      code.push(...bytes);
    }
    emit(0, 97, 115, 109);
    emit(1, 0, 0, 0);
    emit(1, 7, 1, 96, 2, 127, 127, 1, 127);
    emit(2, 11, 1, 2, 106, 115, 3, 109, 101, 109, 2, 0, PAGES);
    emit(3, 2, 1, 0);
    emit(7, 13, 1, 9, 110, 101, 120, 116, 77, 97, 116, 99, 104, 0, 0);
    emit(10);
    const sectionSizeOff = code.length;
    emit(0, 0, 0, 0, 0);
    emit(1);
    const funcSizeOff = code.length;
    emit(0, 0, 0, 0, 0);
    const bodyStart = code.length;
    emit(2, 2, 126, 2, 127);
    emit(65, ...toSignedLeb128(HASH_OFFSET));
    emit(41, 3, 0);
    emit(33, 2);
    emit(65, ...toSignedLeb128(MASK_OFFSET));
    emit(41, 3, 0);
    emit(33, 3);
    emit(32, 0);
    emit(33, 4);
    emit(32, 0);
    emit(32, 1);
    emit(106);
    emit(33, 5);
    emit(2, 64);
    emit(3, 64);
    emit(32, 4);
    emit(32, 5);
    emit(78);
    emit(13, 1);
    emit(32, 2);
    emit(66, 1);
    emit(134);
    emit(32, 4);
    emit(45, 0, 0);
    emit(65, 3);
    emit(116);
    emit(41, 3, 0);
    emit(124);
    emit(34, 2);
    emit(32, 3);
    emit(131);
    emit(80);
    emit(4, 64);
    emit(65, ...toSignedLeb128(HASH_OFFSET));
    emit(32, 2);
    emit(55, 3, 0);
    emit(32, 4);
    emit(32, 0);
    emit(107);
    emit(65, 1);
    emit(106);
    emit(15);
    emit(11);
    emit(32, 4);
    emit(65, 1);
    emit(106);
    emit(33, 4);
    emit(12, 0);
    emit(11);
    emit(11);
    emit(65, ...toSignedLeb128(HASH_OFFSET));
    emit(32, 2);
    emit(55, 3, 0);
    emit(65, 127);
    emit(11);
    const bodySize = code.length - bodyStart;
    const bsPatch = toLebU32Padded5(bodySize);
    for (let i = 0; i < 5; i++)
      code[funcSizeOff + i] = bsPatch[i];
    const secSize = code.length - sectionSizeOff - 5;
    const ssPatch = toLebU32Padded5(secSize);
    for (let i = 0; i < 5; i++)
      code[sectionSizeOff + i] = ssPatch[i];
    return new Uint8Array(code);
  }
  function initWasm() {
    if (wasmFn)
      return;
    const bytes = generateWasmBytes();
    wasmMemory = new WebAssembly.Memory({ initial: PAGES });
    const module = new WebAssembly.Module(bytes);
    const instance = new WebAssembly.Instance(module, { js: { mem: wasmMemory } });
    wasmFn = instance.exports.nextMatch;
    wasmView = new Uint8Array(wasmMemory.buffer);
    const dv = new DataView(wasmMemory.buffer);
    for (let i = 0; i < 256; i++) {
      dv.setBigUint64(TABLE_OFFSET + i * 8, GEAR_TABLE[i], true);
    }
  }
  function wasmNextMatch(inputStart, inputLen) {
    return wasmFn(inputStart, inputLen);
  }
  function getView() {
    return wasmView;
  }

  // node_modules/gearhash-jit/dist/esm/index.js
  var Hasher = class {
    constructor(mask) {
      __publicField(this, "maskBytes");
      /**
       * The current 64-bit rolling hash state as 8 little-endian bytes.
       * Updated after every `nextMatch` call. Zeroed by `resetHash()`.
       */
      __publicField(this, "hash");
      initWasm();
      this.maskBytes = new Uint8Array(8);
      this.hash = new Uint8Array(8);
      new DataView(this.maskBytes.buffer).setBigUint64(0, mask, true);
    }
    /**
     * Scan `buf` for the next gear-hash match. The internal hash state
     * carries over between calls (for split-buffer scanning).
     *
     * @returns 1-based byte position of the match, or -1 if none found.
     */
    nextMatch(buf) {
      const len = buf.length;
      if (len === 0)
        return -1;
      if (len > MAX_INPUT_SIZE) {
        throw new RangeError(`Input too large: ${len} > ${MAX_INPUT_SIZE}`);
      }
      const view = getView();
      view.set(this.hash, HASH_OFFSET);
      view.set(this.maskBytes, MASK_OFFSET);
      view.set(buf, INPUT_OFFSET);
      const pos = wasmNextMatch(INPUT_OFFSET, len);
      this.hash.set(view.subarray(HASH_OFFSET, HASH_OFFSET + 8));
      return pos;
    }
    /** Reset rolling hash to zero (call when starting a new chunk). */
    resetHash() {
      this.hash.fill(0);
    }
  };

  // node_modules/@huggingface/blake3-jit/dist/esm/compress.js
  function compress(cv, cvOff, block, blockOff, out, outOff, full, counter, blockLen, flags) {
    let m0 = block[blockOff] | 0;
    let m1 = block[blockOff + 1] | 0;
    let m2 = block[blockOff + 2] | 0;
    let m3 = block[blockOff + 3] | 0;
    let m4 = block[blockOff + 4] | 0;
    let m5 = block[blockOff + 5] | 0;
    let m6 = block[blockOff + 6] | 0;
    let m7 = block[blockOff + 7] | 0;
    let m8 = block[blockOff + 8] | 0;
    let m9 = block[blockOff + 9] | 0;
    let m10 = block[blockOff + 10] | 0;
    let m11 = block[blockOff + 11] | 0;
    let m12 = block[blockOff + 12] | 0;
    let m13 = block[blockOff + 13] | 0;
    let m14 = block[blockOff + 14] | 0;
    let m15 = block[blockOff + 15] | 0;
    let s0 = cv[cvOff] | 0;
    let s1 = cv[cvOff + 1] | 0;
    let s2 = cv[cvOff + 2] | 0;
    let s3 = cv[cvOff + 3] | 0;
    let s4 = cv[cvOff + 4] | 0;
    let s5 = cv[cvOff + 5] | 0;
    let s6 = cv[cvOff + 6] | 0;
    let s7 = cv[cvOff + 7] | 0;
    let s8 = 1779033703;
    let s9 = 3144134277;
    let s10 = 1013904242;
    let s11 = 2773480762;
    let s12 = counter | 0;
    let s13 = counter / 4294967296 | 0;
    let s14 = blockLen | 0;
    let s15 = flags | 0;
    s0 = (s0 + s4 | 0) + m0 | 0;
    s12 ^= s0;
    s12 = s12 >>> 16 | s12 << 16;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 12 | s4 << 20;
    s0 = (s0 + s4 | 0) + m1 | 0;
    s12 ^= s0;
    s12 = s12 >>> 8 | s12 << 24;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 7 | s4 << 25;
    s1 = (s1 + s5 | 0) + m2 | 0;
    s13 ^= s1;
    s13 = s13 >>> 16 | s13 << 16;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 12 | s5 << 20;
    s1 = (s1 + s5 | 0) + m3 | 0;
    s13 ^= s1;
    s13 = s13 >>> 8 | s13 << 24;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 7 | s5 << 25;
    s2 = (s2 + s6 | 0) + m4 | 0;
    s14 ^= s2;
    s14 = s14 >>> 16 | s14 << 16;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 12 | s6 << 20;
    s2 = (s2 + s6 | 0) + m5 | 0;
    s14 ^= s2;
    s14 = s14 >>> 8 | s14 << 24;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 7 | s6 << 25;
    s3 = (s3 + s7 | 0) + m6 | 0;
    s15 ^= s3;
    s15 = s15 >>> 16 | s15 << 16;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 12 | s7 << 20;
    s3 = (s3 + s7 | 0) + m7 | 0;
    s15 ^= s3;
    s15 = s15 >>> 8 | s15 << 24;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 7 | s7 << 25;
    s0 = (s0 + s5 | 0) + m8 | 0;
    s15 ^= s0;
    s15 = s15 >>> 16 | s15 << 16;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 12 | s5 << 20;
    s0 = (s0 + s5 | 0) + m9 | 0;
    s15 ^= s0;
    s15 = s15 >>> 8 | s15 << 24;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 7 | s5 << 25;
    s1 = (s1 + s6 | 0) + m10 | 0;
    s12 ^= s1;
    s12 = s12 >>> 16 | s12 << 16;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 12 | s6 << 20;
    s1 = (s1 + s6 | 0) + m11 | 0;
    s12 ^= s1;
    s12 = s12 >>> 8 | s12 << 24;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 7 | s6 << 25;
    s2 = (s2 + s7 | 0) + m12 | 0;
    s13 ^= s2;
    s13 = s13 >>> 16 | s13 << 16;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 12 | s7 << 20;
    s2 = (s2 + s7 | 0) + m13 | 0;
    s13 ^= s2;
    s13 = s13 >>> 8 | s13 << 24;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 7 | s7 << 25;
    s3 = (s3 + s4 | 0) + m14 | 0;
    s14 ^= s3;
    s14 = s14 >>> 16 | s14 << 16;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 12 | s4 << 20;
    s3 = (s3 + s4 | 0) + m15 | 0;
    s14 ^= s3;
    s14 = s14 >>> 8 | s14 << 24;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 7 | s4 << 25;
    {
      const t0 = m0, t1 = m1;
      m0 = m2;
      m2 = m3;
      m3 = m10;
      m10 = m12;
      m12 = m9;
      m9 = m11;
      m11 = m5;
      m5 = t0;
      m1 = m6;
      m6 = m4;
      m4 = m7;
      m7 = m13;
      m13 = m14;
      m14 = m15;
      m15 = m8;
      m8 = t1;
    }
    s0 = (s0 + s4 | 0) + m0 | 0;
    s12 ^= s0;
    s12 = s12 >>> 16 | s12 << 16;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 12 | s4 << 20;
    s0 = (s0 + s4 | 0) + m1 | 0;
    s12 ^= s0;
    s12 = s12 >>> 8 | s12 << 24;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 7 | s4 << 25;
    s1 = (s1 + s5 | 0) + m2 | 0;
    s13 ^= s1;
    s13 = s13 >>> 16 | s13 << 16;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 12 | s5 << 20;
    s1 = (s1 + s5 | 0) + m3 | 0;
    s13 ^= s1;
    s13 = s13 >>> 8 | s13 << 24;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 7 | s5 << 25;
    s2 = (s2 + s6 | 0) + m4 | 0;
    s14 ^= s2;
    s14 = s14 >>> 16 | s14 << 16;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 12 | s6 << 20;
    s2 = (s2 + s6 | 0) + m5 | 0;
    s14 ^= s2;
    s14 = s14 >>> 8 | s14 << 24;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 7 | s6 << 25;
    s3 = (s3 + s7 | 0) + m6 | 0;
    s15 ^= s3;
    s15 = s15 >>> 16 | s15 << 16;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 12 | s7 << 20;
    s3 = (s3 + s7 | 0) + m7 | 0;
    s15 ^= s3;
    s15 = s15 >>> 8 | s15 << 24;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 7 | s7 << 25;
    s0 = (s0 + s5 | 0) + m8 | 0;
    s15 ^= s0;
    s15 = s15 >>> 16 | s15 << 16;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 12 | s5 << 20;
    s0 = (s0 + s5 | 0) + m9 | 0;
    s15 ^= s0;
    s15 = s15 >>> 8 | s15 << 24;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 7 | s5 << 25;
    s1 = (s1 + s6 | 0) + m10 | 0;
    s12 ^= s1;
    s12 = s12 >>> 16 | s12 << 16;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 12 | s6 << 20;
    s1 = (s1 + s6 | 0) + m11 | 0;
    s12 ^= s1;
    s12 = s12 >>> 8 | s12 << 24;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 7 | s6 << 25;
    s2 = (s2 + s7 | 0) + m12 | 0;
    s13 ^= s2;
    s13 = s13 >>> 16 | s13 << 16;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 12 | s7 << 20;
    s2 = (s2 + s7 | 0) + m13 | 0;
    s13 ^= s2;
    s13 = s13 >>> 8 | s13 << 24;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 7 | s7 << 25;
    s3 = (s3 + s4 | 0) + m14 | 0;
    s14 ^= s3;
    s14 = s14 >>> 16 | s14 << 16;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 12 | s4 << 20;
    s3 = (s3 + s4 | 0) + m15 | 0;
    s14 ^= s3;
    s14 = s14 >>> 8 | s14 << 24;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 7 | s4 << 25;
    {
      const t0 = m0, t1 = m1;
      m0 = m2;
      m2 = m3;
      m3 = m10;
      m10 = m12;
      m12 = m9;
      m9 = m11;
      m11 = m5;
      m5 = t0;
      m1 = m6;
      m6 = m4;
      m4 = m7;
      m7 = m13;
      m13 = m14;
      m14 = m15;
      m15 = m8;
      m8 = t1;
    }
    s0 = (s0 + s4 | 0) + m0 | 0;
    s12 ^= s0;
    s12 = s12 >>> 16 | s12 << 16;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 12 | s4 << 20;
    s0 = (s0 + s4 | 0) + m1 | 0;
    s12 ^= s0;
    s12 = s12 >>> 8 | s12 << 24;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 7 | s4 << 25;
    s1 = (s1 + s5 | 0) + m2 | 0;
    s13 ^= s1;
    s13 = s13 >>> 16 | s13 << 16;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 12 | s5 << 20;
    s1 = (s1 + s5 | 0) + m3 | 0;
    s13 ^= s1;
    s13 = s13 >>> 8 | s13 << 24;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 7 | s5 << 25;
    s2 = (s2 + s6 | 0) + m4 | 0;
    s14 ^= s2;
    s14 = s14 >>> 16 | s14 << 16;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 12 | s6 << 20;
    s2 = (s2 + s6 | 0) + m5 | 0;
    s14 ^= s2;
    s14 = s14 >>> 8 | s14 << 24;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 7 | s6 << 25;
    s3 = (s3 + s7 | 0) + m6 | 0;
    s15 ^= s3;
    s15 = s15 >>> 16 | s15 << 16;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 12 | s7 << 20;
    s3 = (s3 + s7 | 0) + m7 | 0;
    s15 ^= s3;
    s15 = s15 >>> 8 | s15 << 24;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 7 | s7 << 25;
    s0 = (s0 + s5 | 0) + m8 | 0;
    s15 ^= s0;
    s15 = s15 >>> 16 | s15 << 16;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 12 | s5 << 20;
    s0 = (s0 + s5 | 0) + m9 | 0;
    s15 ^= s0;
    s15 = s15 >>> 8 | s15 << 24;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 7 | s5 << 25;
    s1 = (s1 + s6 | 0) + m10 | 0;
    s12 ^= s1;
    s12 = s12 >>> 16 | s12 << 16;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 12 | s6 << 20;
    s1 = (s1 + s6 | 0) + m11 | 0;
    s12 ^= s1;
    s12 = s12 >>> 8 | s12 << 24;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 7 | s6 << 25;
    s2 = (s2 + s7 | 0) + m12 | 0;
    s13 ^= s2;
    s13 = s13 >>> 16 | s13 << 16;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 12 | s7 << 20;
    s2 = (s2 + s7 | 0) + m13 | 0;
    s13 ^= s2;
    s13 = s13 >>> 8 | s13 << 24;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 7 | s7 << 25;
    s3 = (s3 + s4 | 0) + m14 | 0;
    s14 ^= s3;
    s14 = s14 >>> 16 | s14 << 16;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 12 | s4 << 20;
    s3 = (s3 + s4 | 0) + m15 | 0;
    s14 ^= s3;
    s14 = s14 >>> 8 | s14 << 24;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 7 | s4 << 25;
    {
      const t0 = m0, t1 = m1;
      m0 = m2;
      m2 = m3;
      m3 = m10;
      m10 = m12;
      m12 = m9;
      m9 = m11;
      m11 = m5;
      m5 = t0;
      m1 = m6;
      m6 = m4;
      m4 = m7;
      m7 = m13;
      m13 = m14;
      m14 = m15;
      m15 = m8;
      m8 = t1;
    }
    s0 = (s0 + s4 | 0) + m0 | 0;
    s12 ^= s0;
    s12 = s12 >>> 16 | s12 << 16;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 12 | s4 << 20;
    s0 = (s0 + s4 | 0) + m1 | 0;
    s12 ^= s0;
    s12 = s12 >>> 8 | s12 << 24;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 7 | s4 << 25;
    s1 = (s1 + s5 | 0) + m2 | 0;
    s13 ^= s1;
    s13 = s13 >>> 16 | s13 << 16;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 12 | s5 << 20;
    s1 = (s1 + s5 | 0) + m3 | 0;
    s13 ^= s1;
    s13 = s13 >>> 8 | s13 << 24;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 7 | s5 << 25;
    s2 = (s2 + s6 | 0) + m4 | 0;
    s14 ^= s2;
    s14 = s14 >>> 16 | s14 << 16;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 12 | s6 << 20;
    s2 = (s2 + s6 | 0) + m5 | 0;
    s14 ^= s2;
    s14 = s14 >>> 8 | s14 << 24;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 7 | s6 << 25;
    s3 = (s3 + s7 | 0) + m6 | 0;
    s15 ^= s3;
    s15 = s15 >>> 16 | s15 << 16;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 12 | s7 << 20;
    s3 = (s3 + s7 | 0) + m7 | 0;
    s15 ^= s3;
    s15 = s15 >>> 8 | s15 << 24;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 7 | s7 << 25;
    s0 = (s0 + s5 | 0) + m8 | 0;
    s15 ^= s0;
    s15 = s15 >>> 16 | s15 << 16;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 12 | s5 << 20;
    s0 = (s0 + s5 | 0) + m9 | 0;
    s15 ^= s0;
    s15 = s15 >>> 8 | s15 << 24;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 7 | s5 << 25;
    s1 = (s1 + s6 | 0) + m10 | 0;
    s12 ^= s1;
    s12 = s12 >>> 16 | s12 << 16;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 12 | s6 << 20;
    s1 = (s1 + s6 | 0) + m11 | 0;
    s12 ^= s1;
    s12 = s12 >>> 8 | s12 << 24;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 7 | s6 << 25;
    s2 = (s2 + s7 | 0) + m12 | 0;
    s13 ^= s2;
    s13 = s13 >>> 16 | s13 << 16;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 12 | s7 << 20;
    s2 = (s2 + s7 | 0) + m13 | 0;
    s13 ^= s2;
    s13 = s13 >>> 8 | s13 << 24;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 7 | s7 << 25;
    s3 = (s3 + s4 | 0) + m14 | 0;
    s14 ^= s3;
    s14 = s14 >>> 16 | s14 << 16;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 12 | s4 << 20;
    s3 = (s3 + s4 | 0) + m15 | 0;
    s14 ^= s3;
    s14 = s14 >>> 8 | s14 << 24;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 7 | s4 << 25;
    {
      const t0 = m0, t1 = m1;
      m0 = m2;
      m2 = m3;
      m3 = m10;
      m10 = m12;
      m12 = m9;
      m9 = m11;
      m11 = m5;
      m5 = t0;
      m1 = m6;
      m6 = m4;
      m4 = m7;
      m7 = m13;
      m13 = m14;
      m14 = m15;
      m15 = m8;
      m8 = t1;
    }
    s0 = (s0 + s4 | 0) + m0 | 0;
    s12 ^= s0;
    s12 = s12 >>> 16 | s12 << 16;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 12 | s4 << 20;
    s0 = (s0 + s4 | 0) + m1 | 0;
    s12 ^= s0;
    s12 = s12 >>> 8 | s12 << 24;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 7 | s4 << 25;
    s1 = (s1 + s5 | 0) + m2 | 0;
    s13 ^= s1;
    s13 = s13 >>> 16 | s13 << 16;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 12 | s5 << 20;
    s1 = (s1 + s5 | 0) + m3 | 0;
    s13 ^= s1;
    s13 = s13 >>> 8 | s13 << 24;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 7 | s5 << 25;
    s2 = (s2 + s6 | 0) + m4 | 0;
    s14 ^= s2;
    s14 = s14 >>> 16 | s14 << 16;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 12 | s6 << 20;
    s2 = (s2 + s6 | 0) + m5 | 0;
    s14 ^= s2;
    s14 = s14 >>> 8 | s14 << 24;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 7 | s6 << 25;
    s3 = (s3 + s7 | 0) + m6 | 0;
    s15 ^= s3;
    s15 = s15 >>> 16 | s15 << 16;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 12 | s7 << 20;
    s3 = (s3 + s7 | 0) + m7 | 0;
    s15 ^= s3;
    s15 = s15 >>> 8 | s15 << 24;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 7 | s7 << 25;
    s0 = (s0 + s5 | 0) + m8 | 0;
    s15 ^= s0;
    s15 = s15 >>> 16 | s15 << 16;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 12 | s5 << 20;
    s0 = (s0 + s5 | 0) + m9 | 0;
    s15 ^= s0;
    s15 = s15 >>> 8 | s15 << 24;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 7 | s5 << 25;
    s1 = (s1 + s6 | 0) + m10 | 0;
    s12 ^= s1;
    s12 = s12 >>> 16 | s12 << 16;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 12 | s6 << 20;
    s1 = (s1 + s6 | 0) + m11 | 0;
    s12 ^= s1;
    s12 = s12 >>> 8 | s12 << 24;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 7 | s6 << 25;
    s2 = (s2 + s7 | 0) + m12 | 0;
    s13 ^= s2;
    s13 = s13 >>> 16 | s13 << 16;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 12 | s7 << 20;
    s2 = (s2 + s7 | 0) + m13 | 0;
    s13 ^= s2;
    s13 = s13 >>> 8 | s13 << 24;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 7 | s7 << 25;
    s3 = (s3 + s4 | 0) + m14 | 0;
    s14 ^= s3;
    s14 = s14 >>> 16 | s14 << 16;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 12 | s4 << 20;
    s3 = (s3 + s4 | 0) + m15 | 0;
    s14 ^= s3;
    s14 = s14 >>> 8 | s14 << 24;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 7 | s4 << 25;
    {
      const t0 = m0, t1 = m1;
      m0 = m2;
      m2 = m3;
      m3 = m10;
      m10 = m12;
      m12 = m9;
      m9 = m11;
      m11 = m5;
      m5 = t0;
      m1 = m6;
      m6 = m4;
      m4 = m7;
      m7 = m13;
      m13 = m14;
      m14 = m15;
      m15 = m8;
      m8 = t1;
    }
    s0 = (s0 + s4 | 0) + m0 | 0;
    s12 ^= s0;
    s12 = s12 >>> 16 | s12 << 16;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 12 | s4 << 20;
    s0 = (s0 + s4 | 0) + m1 | 0;
    s12 ^= s0;
    s12 = s12 >>> 8 | s12 << 24;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 7 | s4 << 25;
    s1 = (s1 + s5 | 0) + m2 | 0;
    s13 ^= s1;
    s13 = s13 >>> 16 | s13 << 16;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 12 | s5 << 20;
    s1 = (s1 + s5 | 0) + m3 | 0;
    s13 ^= s1;
    s13 = s13 >>> 8 | s13 << 24;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 7 | s5 << 25;
    s2 = (s2 + s6 | 0) + m4 | 0;
    s14 ^= s2;
    s14 = s14 >>> 16 | s14 << 16;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 12 | s6 << 20;
    s2 = (s2 + s6 | 0) + m5 | 0;
    s14 ^= s2;
    s14 = s14 >>> 8 | s14 << 24;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 7 | s6 << 25;
    s3 = (s3 + s7 | 0) + m6 | 0;
    s15 ^= s3;
    s15 = s15 >>> 16 | s15 << 16;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 12 | s7 << 20;
    s3 = (s3 + s7 | 0) + m7 | 0;
    s15 ^= s3;
    s15 = s15 >>> 8 | s15 << 24;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 7 | s7 << 25;
    s0 = (s0 + s5 | 0) + m8 | 0;
    s15 ^= s0;
    s15 = s15 >>> 16 | s15 << 16;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 12 | s5 << 20;
    s0 = (s0 + s5 | 0) + m9 | 0;
    s15 ^= s0;
    s15 = s15 >>> 8 | s15 << 24;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 7 | s5 << 25;
    s1 = (s1 + s6 | 0) + m10 | 0;
    s12 ^= s1;
    s12 = s12 >>> 16 | s12 << 16;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 12 | s6 << 20;
    s1 = (s1 + s6 | 0) + m11 | 0;
    s12 ^= s1;
    s12 = s12 >>> 8 | s12 << 24;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 7 | s6 << 25;
    s2 = (s2 + s7 | 0) + m12 | 0;
    s13 ^= s2;
    s13 = s13 >>> 16 | s13 << 16;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 12 | s7 << 20;
    s2 = (s2 + s7 | 0) + m13 | 0;
    s13 ^= s2;
    s13 = s13 >>> 8 | s13 << 24;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 7 | s7 << 25;
    s3 = (s3 + s4 | 0) + m14 | 0;
    s14 ^= s3;
    s14 = s14 >>> 16 | s14 << 16;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 12 | s4 << 20;
    s3 = (s3 + s4 | 0) + m15 | 0;
    s14 ^= s3;
    s14 = s14 >>> 8 | s14 << 24;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 7 | s4 << 25;
    {
      const t0 = m0, t1 = m1;
      m0 = m2;
      m2 = m3;
      m3 = m10;
      m10 = m12;
      m12 = m9;
      m9 = m11;
      m11 = m5;
      m5 = t0;
      m1 = m6;
      m6 = m4;
      m4 = m7;
      m7 = m13;
      m13 = m14;
      m14 = m15;
      m15 = m8;
      m8 = t1;
    }
    s0 = (s0 + s4 | 0) + m0 | 0;
    s12 ^= s0;
    s12 = s12 >>> 16 | s12 << 16;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 12 | s4 << 20;
    s0 = (s0 + s4 | 0) + m1 | 0;
    s12 ^= s0;
    s12 = s12 >>> 8 | s12 << 24;
    s8 = s8 + s12 | 0;
    s4 ^= s8;
    s4 = s4 >>> 7 | s4 << 25;
    s1 = (s1 + s5 | 0) + m2 | 0;
    s13 ^= s1;
    s13 = s13 >>> 16 | s13 << 16;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 12 | s5 << 20;
    s1 = (s1 + s5 | 0) + m3 | 0;
    s13 ^= s1;
    s13 = s13 >>> 8 | s13 << 24;
    s9 = s9 + s13 | 0;
    s5 ^= s9;
    s5 = s5 >>> 7 | s5 << 25;
    s2 = (s2 + s6 | 0) + m4 | 0;
    s14 ^= s2;
    s14 = s14 >>> 16 | s14 << 16;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 12 | s6 << 20;
    s2 = (s2 + s6 | 0) + m5 | 0;
    s14 ^= s2;
    s14 = s14 >>> 8 | s14 << 24;
    s10 = s10 + s14 | 0;
    s6 ^= s10;
    s6 = s6 >>> 7 | s6 << 25;
    s3 = (s3 + s7 | 0) + m6 | 0;
    s15 ^= s3;
    s15 = s15 >>> 16 | s15 << 16;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 12 | s7 << 20;
    s3 = (s3 + s7 | 0) + m7 | 0;
    s15 ^= s3;
    s15 = s15 >>> 8 | s15 << 24;
    s11 = s11 + s15 | 0;
    s7 ^= s11;
    s7 = s7 >>> 7 | s7 << 25;
    s0 = (s0 + s5 | 0) + m8 | 0;
    s15 ^= s0;
    s15 = s15 >>> 16 | s15 << 16;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 12 | s5 << 20;
    s0 = (s0 + s5 | 0) + m9 | 0;
    s15 ^= s0;
    s15 = s15 >>> 8 | s15 << 24;
    s10 = s10 + s15 | 0;
    s5 ^= s10;
    s5 = s5 >>> 7 | s5 << 25;
    s1 = (s1 + s6 | 0) + m10 | 0;
    s12 ^= s1;
    s12 = s12 >>> 16 | s12 << 16;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 12 | s6 << 20;
    s1 = (s1 + s6 | 0) + m11 | 0;
    s12 ^= s1;
    s12 = s12 >>> 8 | s12 << 24;
    s11 = s11 + s12 | 0;
    s6 ^= s11;
    s6 = s6 >>> 7 | s6 << 25;
    s2 = (s2 + s7 | 0) + m12 | 0;
    s13 ^= s2;
    s13 = s13 >>> 16 | s13 << 16;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 12 | s7 << 20;
    s2 = (s2 + s7 | 0) + m13 | 0;
    s13 ^= s2;
    s13 = s13 >>> 8 | s13 << 24;
    s8 = s8 + s13 | 0;
    s7 ^= s8;
    s7 = s7 >>> 7 | s7 << 25;
    s3 = (s3 + s4 | 0) + m14 | 0;
    s14 ^= s3;
    s14 = s14 >>> 16 | s14 << 16;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 12 | s4 << 20;
    s3 = (s3 + s4 | 0) + m15 | 0;
    s14 ^= s3;
    s14 = s14 >>> 8 | s14 << 24;
    s9 = s9 + s14 | 0;
    s4 ^= s9;
    s4 = s4 >>> 7 | s4 << 25;
    if (full) {
      out[outOff + 8] = s8 ^ cv[cvOff];
      out[outOff + 9] = s9 ^ cv[cvOff + 1];
      out[outOff + 10] = s10 ^ cv[cvOff + 2];
      out[outOff + 11] = s11 ^ cv[cvOff + 3];
      out[outOff + 12] = s12 ^ cv[cvOff + 4];
      out[outOff + 13] = s13 ^ cv[cvOff + 5];
      out[outOff + 14] = s14 ^ cv[cvOff + 6];
      out[outOff + 15] = s15 ^ cv[cvOff + 7];
    }
    out[outOff] = s0 ^ s8;
    out[outOff + 1] = s1 ^ s9;
    out[outOff + 2] = s2 ^ s10;
    out[outOff + 3] = s3 ^ s11;
    out[outOff + 4] = s4 ^ s12;
    out[outOff + 5] = s5 ^ s13;
    out[outOff + 6] = s6 ^ s14;
    out[outOff + 7] = s7 ^ s15;
  }

  // node_modules/@huggingface/blake3-jit/dist/esm/constants.js
  var IV = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var CHUNK_START = 1;
  var CHUNK_END = 1 << 1;
  var PARENT = 1 << 2;
  var ROOT = 1 << 3;
  var KEYED_HASH = 1 << 4;
  var DERIVE_KEY_CONTEXT = 1 << 5;
  var DERIVE_KEY_MATERIAL = 1 << 6;
  var OUT_LEN = 32;
  var KEY_LEN = 32;
  var BLOCK_LEN = 64;
  var CHUNK_LEN = 1024;
  var MAX_DEPTH = 54;
  var PERMUTATIONS = new Uint8Array([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    2,
    6,
    3,
    10,
    7,
    0,
    4,
    13,
    1,
    11,
    12,
    5,
    9,
    14,
    15,
    8,
    3,
    4,
    10,
    12,
    13,
    2,
    7,
    14,
    6,
    5,
    9,
    0,
    11,
    15,
    8,
    1,
    10,
    7,
    12,
    9,
    14,
    3,
    13,
    15,
    4,
    0,
    11,
    2,
    5,
    8,
    1,
    6,
    12,
    13,
    9,
    11,
    15,
    10,
    14,
    8,
    7,
    2,
    5,
    3,
    0,
    1,
    6,
    4,
    9,
    14,
    11,
    5,
    8,
    12,
    15,
    1,
    13,
    3,
    0,
    10,
    2,
    6,
    4,
    7,
    11,
    15,
    5,
    0,
    1,
    9,
    8,
    6,
    14,
    10,
    2,
    12,
    3,
    4,
    7,
    13
  ]);

  // node_modules/@huggingface/blake3-jit/dist/esm/utils.js
  var IS_LITTLE_ENDIAN = new Uint8Array(new Uint32Array([16909060]).buffer)[0] === 4;
  function readLittleEndianWordsFull(input, offset, words) {
    for (let i = 0; i < 16; ++i, offset += 4) {
      words[i] = input[offset] | input[offset + 1] << 8 | input[offset + 2] << 16 | input[offset + 3] << 24;
    }
  }
  function writeLittleEndianBytesPartial(words, wordOffset, output, byteOffset, byteCount) {
    const fullWords = byteCount >>> 2;
    let i = 0;
    for (; i < fullWords; ++i, byteOffset += 4) {
      const w = words[wordOffset + i];
      output[byteOffset] = w & 255;
      output[byteOffset + 1] = w >>> 8 & 255;
      output[byteOffset + 2] = w >>> 16 & 255;
      output[byteOffset + 3] = w >>> 24 & 255;
    }
    const remaining = byteCount & 3;
    if (remaining > 0) {
      const w = words[wordOffset + i];
      output[byteOffset] = w & 255;
      if (remaining > 1)
        output[byteOffset + 1] = w >>> 8 & 255;
      if (remaining > 2)
        output[byteOffset + 2] = w >>> 16 & 255;
    }
  }
  function encodeUTF8(str) {
    if (typeof TextEncoder !== "undefined") {
      return new TextEncoder().encode(str);
    }
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 128) {
        bytes.push(c);
      } else if (c < 2048) {
        bytes.push(192 | c >> 6, 128 | c & 63);
      } else if (c < 55296 || c >= 57344) {
        bytes.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
      } else {
        i++;
        c = 65536 + ((c & 1023) << 10 | str.charCodeAt(i) & 1023);
        bytes.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
      }
    }
    return new Uint8Array(bytes);
  }
  var CTZ32_TABLE = new Uint8Array([
    0,
    1,
    28,
    2,
    29,
    14,
    24,
    3,
    30,
    22,
    20,
    15,
    25,
    17,
    4,
    8,
    31,
    27,
    13,
    23,
    21,
    19,
    16,
    7,
    26,
    12,
    18,
    6,
    11,
    5,
    10,
    9
  ]);

  // node_modules/@huggingface/blake3-jit/dist/esm/hasher.js
  var XofReader = class {
    constructor(inputCv, blockWords, counter, blockLen, flags) {
      __publicField(this, "inputCv");
      __publicField(this, "blockWords");
      __publicField(this, "counter");
      __publicField(this, "blockLen");
      __publicField(this, "flags");
      __publicField(this, "outputBlock");
      __publicField(this, "outputBlockOffset");
      this.inputCv = inputCv;
      this.blockWords = blockWords;
      this.counter = counter;
      this.blockLen = blockLen;
      this.flags = flags | ROOT;
      this.outputBlock = new Uint32Array(16);
      this.outputBlockOffset = 64;
    }
    /**
     * Read the next `length` bytes of output.
     */
    read(length) {
      const output = new Uint8Array(length);
      let outputOffset = 0;
      while (outputOffset < length) {
        if (this.outputBlockOffset >= 64) {
          compress(
            this.inputCv,
            0,
            this.blockWords,
            0,
            this.outputBlock,
            0,
            true,
            // full 64-byte output
            this.counter++,
            this.blockLen,
            this.flags
          );
          this.outputBlockOffset = 0;
        }
        const available = 64 - this.outputBlockOffset;
        const toCopy = Math.min(available, length - outputOffset);
        const wordOffset = this.outputBlockOffset >>> 2;
        const byteWithinWord = this.outputBlockOffset & 3;
        if (byteWithinWord === 0 && toCopy >= 4) {
          const fullWords = toCopy >>> 2;
          writeLittleEndianBytesPartial(this.outputBlock, wordOffset, output, outputOffset, fullWords << 2);
          const bytesCopied = fullWords << 2;
          outputOffset += bytesCopied;
          this.outputBlockOffset += bytesCopied;
        } else {
          for (let i = 0; i < toCopy; i++) {
            const wordIdx = this.outputBlockOffset + i >>> 2;
            const byteIdx = this.outputBlockOffset + i & 3;
            output[outputOffset + i] = this.outputBlock[wordIdx] >>> (byteIdx << 3) & 255;
          }
          outputOffset += toCopy;
          this.outputBlockOffset += toCopy;
        }
      }
      return output;
    }
  };
  var ChunkState = class {
    constructor(keyWords, chunkCounter, flags) {
      __publicField(this, "chainingValue");
      __publicField(this, "chunkCounter");
      __publicField(this, "blockWords");
      __publicField(this, "blockLen");
      __publicField(this, "blocksCompressed");
      __publicField(this, "flags");
      this.chainingValue = new Uint32Array(keyWords);
      this.chunkCounter = chunkCounter;
      this.blockWords = new Uint32Array(16);
      this.blockLen = 0;
      this.blocksCompressed = 0;
      this.flags = flags;
    }
    resetTo(keyWords, chunkCounter, flags) {
      this.chainingValue.set(keyWords);
      this.chunkCounter = chunkCounter;
      this.blockLen = 0;
      this.blocksCompressed = 0;
      this.flags = flags;
    }
    /**
     * Get the flags for the current block.
     */
    startFlag() {
      return this.blocksCompressed === 0 ? CHUNK_START : 0;
    }
    /**
     * Update the chunk state with input data.
     * Returns the number of bytes consumed.
     */
    update(input, inputOffset, inputLen) {
      let consumed = 0;
      while (inputLen > 0) {
        if (this.blockLen === BLOCK_LEN) {
          compress(this.chainingValue, 0, this.blockWords, 0, this.chainingValue, 0, false, this.chunkCounter, BLOCK_LEN, this.flags | this.startFlag());
          this.blocksCompressed++;
          this.blockLen = 0;
        }
        const want = BLOCK_LEN - this.blockLen;
        const take = Math.min(want, inputLen);
        if (this.blockLen === 0 && take === BLOCK_LEN) {
          readLittleEndianWordsFull(input, inputOffset, this.blockWords);
        } else {
          for (let i = 0; i < take; i++) {
            const pos = this.blockLen + i;
            const wordIdx = pos >>> 2;
            const byteIdx = pos & 3;
            if (byteIdx === 0) {
              this.blockWords[wordIdx] = input[inputOffset + i];
            } else {
              this.blockWords[wordIdx] |= input[inputOffset + i] << (byteIdx << 3);
            }
          }
        }
        this.blockLen += take;
        inputOffset += take;
        inputLen -= take;
        consumed += take;
      }
      return consumed;
    }
    /**
     * Finalize this chunk and return its output.
     * Returns 8 words (chaining value) or 16 words (if root).
     */
    output() {
      const usedWords = this.blockLen + 3 >>> 2;
      for (let i = usedWords; i < 16; i++) {
        this.blockWords[i] = 0;
      }
      return {
        inputCv: this.chainingValue,
        blockWords: this.blockWords,
        blockLen: this.blockLen,
        counter: this.chunkCounter,
        flags: this.flags | this.startFlag() | CHUNK_END
      };
    }
    /**
     * Get the number of bytes in this chunk.
     */
    len() {
      return this.blocksCompressed * BLOCK_LEN + this.blockLen;
    }
  };
  var Hasher2 = class _Hasher {
    /**
     * Create a new Hasher.
     *
     * @param keyWords - Initial key words (IV for regular hashing)
     * @param flags - Domain separation flags
     */
    constructor(keyWords, flags) {
      __publicField(this, "chunkState");
      __publicField(this, "keyWords");
      __publicField(this, "cvStack");
      __publicField(this, "cvStackLen");
      __publicField(this, "flags");
      __publicField(this, "parentBlock");
      __publicField(this, "parentCv");
      __publicField(this, "chunkCv");
      __publicField(this, "outWords");
      __publicField(this, "finalizeCv");
      this.keyWords = keyWords ? new Uint32Array(keyWords) : new Uint32Array(IV);
      this.flags = flags ?? 0;
      this.chunkState = new ChunkState(this.keyWords, 0, this.flags);
      this.cvStack = new Uint32Array(MAX_DEPTH * 8);
      this.cvStackLen = 0;
      this.parentBlock = new Uint32Array(16);
      this.parentCv = new Uint32Array(8);
      this.chunkCv = new Uint32Array(8);
      this.outWords = new Uint32Array(16);
      this.finalizeCv = new Uint32Array(8);
    }
    /**
     * Reset the hasher to process a new message with the same key/flags.
     * Reuses all internal buffers — zero allocations.
     */
    reset() {
      this.chunkState.resetTo(this.keyWords, 0, this.flags);
      this.cvStackLen = 0;
      return this;
    }
    /**
     * Create a new keyed hasher (MAC).
     *
     * @param key - 32-byte key
     */
    static newKeyed(key) {
      if (key.length !== KEY_LEN) {
        throw new Error(`Key must be ${KEY_LEN} bytes, got ${key.length}`);
      }
      const keyWords = new Uint32Array(8);
      if (IS_LITTLE_ENDIAN) {
        const view = new Uint32Array(key.buffer, key.byteOffset, 8);
        keyWords.set(view);
      } else {
        for (let i = 0; i < 8; i++) {
          const off = i * 4;
          keyWords[i] = key[off] | key[off + 1] << 8 | key[off + 2] << 16 | key[off + 3] << 24;
        }
      }
      return new _Hasher(keyWords, KEYED_HASH);
    }
    /**
     * Create a new key derivation hasher.
     *
     * @param context - Context string for domain separation
     */
    static newDeriveKey(context) {
      const contextBytes = encodeUTF8(context);
      const contextHasher = new _Hasher(new Uint32Array(IV), DERIVE_KEY_CONTEXT);
      contextHasher.update(contextBytes);
      const contextKey = new Uint32Array(8);
      const output = contextHasher.finalizeOutput();
      compress(output.inputCv, 0, output.blockWords, 0, contextKey, 0, false, output.counter, output.blockLen, output.flags | ROOT);
      return new _Hasher(contextKey, DERIVE_KEY_MATERIAL);
    }
    /**
     * Push a chaining value onto the stack.
     */
    pushCv(cv, cvOffset) {
      this.cvStack.set(cv.subarray(cvOffset, cvOffset + 8), this.cvStackLen * 8);
      this.cvStackLen++;
    }
    /**
     * Pop a chaining value from the stack.
     */
    popCv(out, outOffset) {
      this.cvStackLen--;
      out.set(this.cvStack.subarray(this.cvStackLen * 8, (this.cvStackLen + 1) * 8), outOffset);
    }
    /**
     * Add a chunk's chaining value and merge completed subtrees.
     */
    addChunkCv(newCv, newCvOffset, totalChunks) {
      const parentBlock = this.parentBlock;
      const parentCv = this.parentCv;
      while ((totalChunks & 1) === 0) {
        this.popCv(parentBlock, 0);
        parentBlock.set(newCv.subarray(newCvOffset, newCvOffset + 8), 8);
        compress(this.keyWords, 0, parentBlock, 0, parentCv, 0, false, 0, BLOCK_LEN, this.flags | PARENT);
        newCv = parentCv;
        newCvOffset = 0;
        totalChunks >>>= 1;
      }
      this.pushCv(newCv, newCvOffset);
    }
    /**
     * Update the hasher with input data.
     *
     * @param input - Data to hash
     * @returns this (for chaining)
     */
    update(input) {
      let inputOffset = 0;
      let inputLen = input.length;
      while (inputLen > 0) {
        if (this.chunkState.len() === CHUNK_LEN) {
          const output = this.chunkState.output();
          const chunkCv = this.chunkCv;
          compress(output.inputCv, 0, output.blockWords, 0, chunkCv, 0, false, output.counter, output.blockLen, output.flags);
          const totalChunks = this.chunkState.chunkCounter + 1;
          this.addChunkCv(chunkCv, 0, totalChunks);
          this.chunkState.resetTo(this.keyWords, totalChunks, this.flags);
        }
        const want = CHUNK_LEN - this.chunkState.len();
        const take = Math.min(want, inputLen);
        this.chunkState.update(input, inputOffset, take);
        inputOffset += take;
        inputLen -= take;
      }
      return this;
    }
    /**
     * Get the output parameters (for XOF mode or finalization).
     */
    finalizeOutput() {
      let output = this.chunkState.output();
      let parentBlock = this.parentBlock;
      let cv = this.finalizeCv;
      if (this.cvStackLen > 0) {
        compress(output.inputCv, 0, output.blockWords, 0, cv, 0, false, output.counter, output.blockLen, output.flags);
        while (this.cvStackLen > 0) {
          this.cvStackLen--;
          parentBlock.set(this.cvStack.subarray(this.cvStackLen * 8, (this.cvStackLen + 1) * 8), 0);
          parentBlock.set(cv, 8);
          if (this.cvStackLen > 0) {
            compress(this.keyWords, 0, parentBlock, 0, cv, 0, false, 0, BLOCK_LEN, this.flags | PARENT);
          } else {
            return {
              inputCv: this.keyWords,
              blockWords: parentBlock,
              blockLen: BLOCK_LEN,
              counter: 0,
              flags: this.flags | PARENT
            };
          }
        }
      }
      return output;
    }
    /**
     * Finalize the hash and return the result.
     *
     * @param outputLength - Number of bytes to output (default: 32)
     * @returns The hash output
     */
    finalize(outputLength = OUT_LEN) {
      const output = this.finalizeOutput();
      const result = new Uint8Array(outputLength);
      if (outputLength <= 64) {
        const outWords = this.outWords;
        compress(
          output.inputCv,
          0,
          output.blockWords,
          0,
          outWords,
          0,
          outputLength > 32,
          // full output if > 32 bytes
          output.counter,
          output.blockLen,
          output.flags | ROOT
        );
        if (IS_LITTLE_ENDIAN) {
          const outBytes = new Uint8Array(outWords.buffer);
          result.set(outBytes.subarray(0, outputLength));
        } else {
          writeLittleEndianBytesPartial(outWords, 0, result, 0, outputLength);
        }
      } else {
        const xof = this.finalizeXof();
        const full = xof.read(outputLength);
        result.set(full);
      }
      return result;
    }
    /**
     * Finalize and return an XOF reader for arbitrary-length output.
     */
    finalizeXof() {
      const output = this.finalizeOutput();
      return new XofReader(new Uint32Array(output.inputCv), new Uint32Array(output.blockWords), output.counter, output.blockLen, output.flags);
    }
  };

  // node_modules/@huggingface/blake3-jit/dist/esm/wasm-simd.js
  function toLebU32Min2(n) {
    return [n & 127 | 128, n >>> 7 & 127];
  }
  function toLebU32Padded52(n) {
    return [
      n & 127 | 128,
      n >>> 7 & 127 | 128,
      n >>> 14 & 127 | 128,
      n >>> 21 & 127 | 128,
      n >>> 28 & 15
      // Last byte has no continuation bit
    ];
  }
  function toSignedLeb128_i32(n) {
    const bytes = [];
    let value = n | 0;
    let more = true;
    while (more) {
      let byte = value & 127;
      value >>= 7;
      if (value === 0 && (byte & 64) === 0 || value === -1 && (byte & 64) !== 0) {
        more = false;
      } else {
        byte |= 128;
      }
      bytes.push(byte);
    }
    return bytes;
  }
  var MSG_ACCESS_ORDER = [
    // Round 1: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    // Round 2: 2,6,3,10,7,0,4,13,1,11,12,5,9,14,15,8
    2,
    6,
    3,
    10,
    7,
    0,
    4,
    13,
    1,
    11,
    12,
    5,
    9,
    14,
    15,
    8,
    // Round 3: 3,4,10,12,13,2,7,14,6,5,9,0,11,15,8,1
    3,
    4,
    10,
    12,
    13,
    2,
    7,
    14,
    6,
    5,
    9,
    0,
    11,
    15,
    8,
    1,
    // Round 4: 10,7,12,9,14,3,13,15,4,0,11,2,5,8,1,6
    10,
    7,
    12,
    9,
    14,
    3,
    13,
    15,
    4,
    0,
    11,
    2,
    5,
    8,
    1,
    6,
    // Round 5: 12,13,9,11,15,10,14,8,7,2,5,3,0,1,6,4
    12,
    13,
    9,
    11,
    15,
    10,
    14,
    8,
    7,
    2,
    5,
    3,
    0,
    1,
    6,
    4,
    // Round 6: 9,14,11,5,8,12,15,1,13,3,0,10,2,6,4,7
    9,
    14,
    11,
    5,
    8,
    12,
    15,
    1,
    13,
    3,
    0,
    10,
    2,
    6,
    4,
    7,
    // Round 7: 11,15,5,0,1,9,8,6,14,10,2,12,3,4,7,13
    11,
    15,
    5,
    0,
    1,
    9,
    8,
    6,
    14,
    10,
    2,
    12,
    3,
    4,
    7,
    13
  ];
  function generateWasmBytes2() {
    const code = [];
    function put(bytes) {
      code.push(...bytes);
    }
    put([0, 97, 115, 109]);
    put([1, 0, 0, 0]);
    put([1]);
    put([4]);
    put([1]);
    put([96, 0, 0]);
    put([2]);
    put([11]);
    put([1]);
    put([2, 106, 115]);
    put([3, 109, 101, 109]);
    put([2, 0, 1]);
    put([3]);
    put([4]);
    put([3]);
    put([0]);
    put([0]);
    put([0]);
    put([7]);
    put([50]);
    put([3]);
    put([10]);
    put([99, 111, 109, 112, 114, 101, 115, 115, 52, 120]);
    put([0, 0]);
    put([16]);
    put([
      99,
      111,
      109,
      112,
      114,
      101,
      115,
      115,
      67,
      104,
      117,
      110,
      107,
      115,
      52,
      120
    ]);
    put([0, 1]);
    put([14]);
    put([99, 111, 109, 112, 114, 101, 115, 115, 80, 97, 114, 101, 110, 116]);
    put([0, 2]);
    put([10]);
    const sectionSizeOffset = code.length;
    put([0, 0, 0, 0, 0]);
    put([3]);
    const funcSizeOffset = code.length;
    put([0, 0, 0, 0, 0]);
    const funcBodyStart = code.length;
    put([1]);
    put([32, 123]);
    for (let i = 0; i < 16; i++) {
      put([65, ...toLebU32Min2(i * 16)]);
      put([253, 0, 2, 0]);
      put([33, i]);
    }
    for (let i = 0; i < 8; i++) {
      put([65, ...toLebU32Min2(512 + i * 16)]);
      put([253, 0, 2, 0]);
      put([33, 16 + i]);
    }
    const IV2 = [1779033703, 3144134277, 1013904242, 2773480762];
    for (let i = 0; i < 4; i++) {
      const ivBytes = [];
      for (let j = 0; j < 4; j++) {
        ivBytes.push(IV2[i] & 255);
        ivBytes.push(IV2[i] >>> 8 & 255);
        ivBytes.push(IV2[i] >>> 16 & 255);
        ivBytes.push(IV2[i] >>> 24 & 255);
      }
      put([253, 12, ...ivBytes]);
      put([33, 24 + i]);
    }
    put([65, ...toLebU32Min2(768)]);
    put([253, 0, 2, 0]);
    put([33, 28]);
    put([65, ...toLebU32Min2(784)]);
    put([253, 0, 2, 0]);
    put([33, 29]);
    put([65, ...toLebU32Min2(800)]);
    put([253, 0, 2, 0]);
    put([33, 30]);
    put([65, ...toLebU32Min2(816)]);
    put([253, 0, 2, 0]);
    put([33, 31]);
    let msgIdx = 0;
    function g(a, b, c, d) {
      const mx = MSG_ACCESS_ORDER[msgIdx++];
      const my = MSG_ACCESS_ORDER[msgIdx++];
      put([32, 16 + a]);
      put([32, 16 + b]);
      put([253, 174, 1]);
      put([32, mx]);
      put([253, 174, 1]);
      put([33, 16 + a]);
      put([32, 16 + d]);
      put([32, 16 + a]);
      put([253, 81]);
      put([34, 16 + d]);
      put([32, 16 + d]);
      put([253, 13, 2, 3, 0, 1, 6, 7, 4, 5, 10, 11, 8, 9, 14, 15, 12, 13]);
      put([33, 16 + d]);
      put([32, 16 + c]);
      put([32, 16 + d]);
      put([253, 174, 1]);
      put([33, 16 + c]);
      put([32, 16 + b]);
      put([32, 16 + c]);
      put([253, 81]);
      put([34, 16 + b]);
      put([65, 12]);
      put([253, 173, 1]);
      put([32, 16 + b]);
      put([65, 20]);
      put([253, 171, 1]);
      put([253, 80]);
      put([33, 16 + b]);
      put([32, 16 + a]);
      put([32, 16 + b]);
      put([253, 174, 1]);
      put([32, my]);
      put([253, 174, 1]);
      put([33, 16 + a]);
      put([32, 16 + d]);
      put([32, 16 + a]);
      put([253, 81]);
      put([34, 16 + d]);
      put([32, 16 + d]);
      put([253, 13, 1, 2, 3, 0, 5, 6, 7, 4, 9, 10, 11, 8, 13, 14, 15, 12]);
      put([33, 16 + d]);
      put([32, 16 + c]);
      put([32, 16 + d]);
      put([253, 174, 1]);
      put([33, 16 + c]);
      put([32, 16 + b]);
      put([32, 16 + c]);
      put([253, 81]);
      put([34, 16 + b]);
      put([65, 7]);
      put([253, 173, 1]);
      put([32, 16 + b]);
      put([65, 25]);
      put([253, 171, 1]);
      put([253, 80]);
      put([33, 16 + b]);
    }
    for (let round = 0; round < 7; round++) {
      g(0, 4, 8, 12);
      g(1, 5, 9, 13);
      g(2, 6, 10, 14);
      g(3, 7, 11, 15);
      g(0, 5, 10, 15);
      g(1, 6, 11, 12);
      g(2, 7, 8, 13);
      g(3, 4, 9, 14);
    }
    for (let i = 0; i < 8; i++) {
      put([65, ...toLebU32Min2(640 + i * 16)]);
      put([32, 16 + i]);
      put([32, 24 + i]);
      put([253, 81]);
      put([253, 11, 2, 0]);
    }
    put([11]);
    const funcBodySize = code.length - funcBodyStart;
    const funcSizeBytes = toLebU32Padded52(funcBodySize);
    for (let i = 0; i < 5; i++) {
      code[funcSizeOffset + i] = funcSizeBytes[i];
    }
    const func1SizeOffset = code.length;
    put([0, 0, 0, 0, 0]);
    const func1BodyStart = code.length;
    const compressChunksBody = generateCompressChunks4xBody();
    put(compressChunksBody);
    const func1BodySize = code.length - func1BodyStart;
    const func1SizeBytes = toLebU32Padded52(func1BodySize);
    for (let i = 0; i < 5; i++) {
      code[func1SizeOffset + i] = func1SizeBytes[i];
    }
    const func2SizeOffset = code.length;
    put([0, 0, 0, 0, 0]);
    const func2BodyStart = code.length;
    const compressParentBody = generateCompressParentBody();
    put(compressParentBody);
    const func2BodySize = code.length - func2BodyStart;
    const func2SizeBytes = toLebU32Padded52(func2BodySize);
    for (let i = 0; i < 5; i++) {
      code[func2SizeOffset + i] = func2SizeBytes[i];
    }
    const sectionSize = code.length - sectionSizeOffset - 5;
    const sectionSizeBytes = toLebU32Padded52(sectionSize);
    for (let i = 0; i < 5; i++) {
      code[sectionSizeOffset + i] = sectionSizeBytes[i];
    }
    return new Uint8Array(code);
  }
  function generateCompressChunks4xBody() {
    const code = [];
    function put(bytes) {
      code.push(...bytes);
    }
    put([2]);
    put([32, 123]);
    put([1, 127]);
    const BATCH_BLOCK_WORDS = SIMD_MEMORY.BATCH_BLOCK_WORDS;
    const BATCH_CV = SIMD_MEMORY.BATCH_CV;
    const BATCH_COUNTER_LOW = SIMD_MEMORY.BATCH_COUNTER_LOW;
    const BATCH_FLAGS_BASE = SIMD_MEMORY.BATCH_FLAGS_BASE;
    const BATCH_OUTPUT = SIMD_MEMORY.BATCH_OUTPUT;
    const IV2 = [1779033703, 3144134277, 1013904242, 2773480762];
    for (let i = 0; i < 8; i++) {
      put([65, ...toLebU32Min2(BATCH_CV + i * 16)]);
      put([253, 0, 2, 0]);
      put([33, 16 + i]);
    }
    put([65, 0]);
    put([33, 32]);
    put([2, 64]);
    put([3, 64]);
    for (let w = 0; w < 16; w++) {
      put([32, 32]);
      put([65, ...toLebU32Min2(256)]);
      put([108]);
      put([65, ...toLebU32Min2(BATCH_BLOCK_WORDS + w * 16)]);
      put([106]);
      put([253, 0, 2, 0]);
      put([33, w]);
    }
    for (let i = 0; i < 4; i++) {
      const ivBytes = [];
      for (let j = 0; j < 4; j++) {
        ivBytes.push(IV2[i] & 255);
        ivBytes.push(IV2[i] >>> 8 & 255);
        ivBytes.push(IV2[i] >>> 16 & 255);
        ivBytes.push(IV2[i] >>> 24 & 255);
      }
      put([253, 12, ...ivBytes]);
      put([33, 24 + i]);
    }
    put([65, ...toLebU32Min2(BATCH_COUNTER_LOW)]);
    put([253, 0, 2, 0]);
    put([33, 28]);
    put([253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    put([33, 29]);
    const blockLen64 = [];
    for (let j = 0; j < 4; j++) {
      blockLen64.push(64, 0, 0, 0);
    }
    put([253, 12, ...blockLen64]);
    put([33, 30]);
    put([65, ...toLebU32Min2(BATCH_FLAGS_BASE)]);
    put([253, 0, 2, 0]);
    put([32, 32]);
    put([69]);
    put([32, 32]);
    put([65, 15]);
    put([70]);
    put([65, 1]);
    put([116]);
    put([114]);
    put([253, 17]);
    put([253, 80]);
    put([33, 31]);
    let msgIdx = 0;
    function g(a, b, c, d) {
      const mx = MSG_ACCESS_ORDER[msgIdx++];
      const my = MSG_ACCESS_ORDER[msgIdx++];
      put([32, 16 + a]);
      put([32, 16 + b]);
      put([253, 174, 1]);
      put([32, mx]);
      put([253, 174, 1]);
      put([33, 16 + a]);
      put([32, 16 + d]);
      put([32, 16 + a]);
      put([253, 81]);
      put([34, 16 + d]);
      put([32, 16 + d]);
      put([253, 13, 2, 3, 0, 1, 6, 7, 4, 5, 10, 11, 8, 9, 14, 15, 12, 13]);
      put([33, 16 + d]);
      put([32, 16 + c]);
      put([32, 16 + d]);
      put([253, 174, 1]);
      put([33, 16 + c]);
      put([32, 16 + b]);
      put([32, 16 + c]);
      put([253, 81]);
      put([34, 16 + b]);
      put([65, 12]);
      put([253, 173, 1]);
      put([32, 16 + b]);
      put([65, 20]);
      put([253, 171, 1]);
      put([253, 80]);
      put([33, 16 + b]);
      put([32, 16 + a]);
      put([32, 16 + b]);
      put([253, 174, 1]);
      put([32, my]);
      put([253, 174, 1]);
      put([33, 16 + a]);
      put([32, 16 + d]);
      put([32, 16 + a]);
      put([253, 81]);
      put([34, 16 + d]);
      put([32, 16 + d]);
      put([253, 13, 1, 2, 3, 0, 5, 6, 7, 4, 9, 10, 11, 8, 13, 14, 15, 12]);
      put([33, 16 + d]);
      put([32, 16 + c]);
      put([32, 16 + d]);
      put([253, 174, 1]);
      put([33, 16 + c]);
      put([32, 16 + b]);
      put([32, 16 + c]);
      put([253, 81]);
      put([34, 16 + b]);
      put([65, 7]);
      put([253, 173, 1]);
      put([32, 16 + b]);
      put([65, 25]);
      put([253, 171, 1]);
      put([253, 80]);
      put([33, 16 + b]);
    }
    for (let round = 0; round < 7; round++) {
      g(0, 4, 8, 12);
      g(1, 5, 9, 13);
      g(2, 6, 10, 14);
      g(3, 7, 11, 15);
      g(0, 5, 10, 15);
      g(1, 6, 11, 12);
      g(2, 7, 8, 13);
      g(3, 4, 9, 14);
    }
    for (let i = 0; i < 8; i++) {
      put([32, 16 + i]);
      put([32, 24 + i]);
      put([253, 81]);
      put([33, 16 + i]);
    }
    put([32, 32]);
    put([65, 1]);
    put([106]);
    put([34, 32]);
    put([65, 16]);
    put([73]);
    put([13, 0]);
    put([11]);
    put([11]);
    for (let i = 0; i < 8; i++) {
      put([65, ...toLebU32Min2(BATCH_OUTPUT + i * 16)]);
      put([32, 16 + i]);
      put([253, 11, 2, 0]);
    }
    put([11]);
    return code;
  }
  function generateCompressParentBody() {
    const code = [];
    function put(bytes) {
      code.push(...bytes);
    }
    put([1]);
    put([32, 127]);
    const PARENT_BLOCK_OFFSET = SIMD_MEMORY.PARENT_BLOCK;
    const CHUNK_CV_OFFSET = SIMD_MEMORY.CHUNK_CV;
    const IV2 = [
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ];
    for (let i = 0; i < 16; i++) {
      put([65, ...toLebU32Min2(PARENT_BLOCK_OFFSET + i * 4)]);
      put([40, 2, 0]);
      put([33, i]);
    }
    for (let i = 0; i < 8; i++) {
      put([65, ...toSignedLeb128_i32(IV2[i])]);
      put([33, 16 + i]);
    }
    for (let i = 0; i < 4; i++) {
      put([65, ...toSignedLeb128_i32(IV2[i])]);
      put([33, 24 + i]);
    }
    put([65, 0]);
    put([33, 28]);
    put([65, 0]);
    put([33, 29]);
    put([65, 192, 0]);
    put([33, 30]);
    put([65, 4]);
    put([33, 31]);
    function g(a, b, c, d, mx, my) {
      const sa = 16 + a, sb = 16 + b, sc = 16 + c, sd = 16 + d;
      put([32, sa]);
      put([32, sb]);
      put([106]);
      put([32, mx]);
      put([106]);
      put([33, sa]);
      put([32, sd]);
      put([32, sa]);
      put([115]);
      put([65, 16]);
      put([120]);
      put([33, sd]);
      put([32, sc]);
      put([32, sd]);
      put([106]);
      put([33, sc]);
      put([32, sb]);
      put([32, sc]);
      put([115]);
      put([65, 12]);
      put([120]);
      put([33, sb]);
      put([32, sa]);
      put([32, sb]);
      put([106]);
      put([32, my]);
      put([106]);
      put([33, sa]);
      put([32, sd]);
      put([32, sa]);
      put([115]);
      put([65, 8]);
      put([120]);
      put([33, sd]);
      put([32, sc]);
      put([32, sd]);
      put([106]);
      put([33, sc]);
      put([32, sb]);
      put([32, sc]);
      put([115]);
      put([65, 7]);
      put([120]);
      put([33, sb]);
    }
    let msgIdx = 0;
    for (let round = 0; round < 7; round++) {
      g(0, 4, 8, 12, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
      g(1, 5, 9, 13, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
      g(2, 6, 10, 14, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
      g(3, 7, 11, 15, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
      g(0, 5, 10, 15, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
      g(1, 6, 11, 12, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
      g(2, 7, 8, 13, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
      g(3, 4, 9, 14, MSG_ACCESS_ORDER[msgIdx], MSG_ACCESS_ORDER[msgIdx + 1]);
      msgIdx += 2;
    }
    for (let i = 0; i < 8; i++) {
      put([65, ...toLebU32Min2(CHUNK_CV_OFFSET + i * 4)]);
      put([32, 16 + i]);
      put([32, 24 + i]);
      put([115]);
      put([54, 2, 0]);
    }
    put([11]);
    return code;
  }
  var wasmInstance = null;
  var wasmMemory2 = null;
  var wasmCompress4x = null;
  var wasmCompressChunks4x = null;
  var wasmCompressParent = null;
  var wasmMemoryView = null;
  var wasmMemoryView32 = null;
  function isSimdSupported() {
    try {
      const simdTest = new Uint8Array([
        0,
        97,
        115,
        109,
        // magic: \0asm
        1,
        0,
        0,
        0,
        // version: 1
        // Type section (id=1): () -> v128
        1,
        // section id = 1 (type)
        5,
        // section length = 5
        1,
        // 1 type
        96,
        0,
        1,
        123,
        // func () -> v128
        // Function section (id=3)
        3,
        // section id = 3 (function)
        2,
        // section length = 2
        1,
        // 1 function
        0,
        // type index 0
        // Code section (id=10) with v128.const
        10,
        // section id = 10 (code)
        22,
        // section length = 22
        1,
        // 1 function body
        20,
        // body length = 20
        0,
        // 0 locals
        253,
        12,
        // v128.const opcode
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11
        // end
      ]);
      return WebAssembly.validate(simdTest);
    } catch {
      return false;
    }
  }
  function setupArenaViews() {
    if (!wasmMemory2)
      return;
    const buffer = wasmMemory2.buffer;
    arenaCvStack = new Uint32Array(buffer, SIMD_MEMORY.CV_STACK, 64 * 8);
    arenaParentBlock = new Uint32Array(buffer, SIMD_MEMORY.PARENT_BLOCK, 16);
    arenaChunkCv = new Uint32Array(buffer, SIMD_MEMORY.CHUNK_CV, 8);
    arenaTempCvs = new Uint32Array(buffer, SIMD_MEMORY.TEMP_CVS, 32);
    arenaBatchBlockWords = new Uint32Array(buffer, SIMD_MEMORY.BATCH_BLOCK_WORDS, 16 * 16 * 4);
    arenaBatchCv = new Uint32Array(buffer, SIMD_MEMORY.BATCH_CV, 32);
    arenaBatchCounterLow = new Uint32Array(buffer, SIMD_MEMORY.BATCH_COUNTER_LOW, 4);
    arenaBatchFlagsBase = new Uint32Array(buffer, SIMD_MEMORY.BATCH_FLAGS_BASE, 4);
    arenaBatchOutput = new Uint32Array(buffer, SIMD_MEMORY.BATCH_OUTPUT, 32);
  }
  var cachedWasmBytes = null;
  function initSimdSync() {
    if (wasmInstance)
      return true;
    if (!isSimdSupported()) {
      return false;
    }
    try {
      const wasmBytes = cachedWasmBytes || generateWasmBytes2();
      cachedWasmBytes = wasmBytes;
      wasmMemory2 = new WebAssembly.Memory({ initial: 1 });
      const importObject = {
        js: { mem: wasmMemory2 }
      };
      const module = new WebAssembly.Module(wasmBytes.buffer);
      wasmInstance = new WebAssembly.Instance(module, importObject);
      wasmCompress4x = wasmInstance.exports.compress4x;
      wasmCompressChunks4x = wasmInstance.exports.compressChunks4x;
      wasmCompressParent = wasmInstance.exports.compressParent;
      wasmMemoryView = new Uint8Array(wasmMemory2.buffer);
      wasmMemoryView32 = new Uint32Array(wasmMemory2.buffer);
      setupArenaViews();
      return true;
    } catch (e) {
      console.warn("Failed to initialize WASM SIMD:", e);
      return false;
    }
  }
  var SIMD_MEMORY = {
    // SIMD compress4x working area (used by WASM code) - single block
    BLOCK_WORDS: 0,
    // 4 x 16 words = 512 bytes (transposed layout)
    CHAINING_VALUES: 512,
    // 4 x 8 words = 128 bytes
    OUTPUT: 640,
    // 4 x 8 words = 128 bytes
    COUNTER_LOW: 768,
    // 4 words = 16 bytes
    COUNTER_HIGH: 784,
    // 4 words = 16 bytes
    BLOCK_LEN: 800,
    // 4 words = 16 bytes
    FLAGS: 816,
    // 4 words = 16 bytes
    // End of single-block SIMD working area: 832 bytes
    // SIMD compressChunks4x working area - 16 blocks batched
    // Each block position has 16 v128 values (one per message word) = 256 bytes
    // 16 block positions = 16 × 256 = 4096 bytes
    BATCH_BLOCK_WORDS: 832,
    // 16 positions × 256 bytes = 4096 bytes (transposed), ends at 4928
    BATCH_CV: 4928,
    // 4 × 8 words × 4 bytes = 128 bytes (working CVs), ends at 5056
    BATCH_COUNTER_LOW: 5056,
    // 4 words × 4 bytes = 16 bytes (per-chunk counters), ends at 5072
    BATCH_FLAGS_BASE: 5072,
    // 4 words × 4 bytes = 16 bytes (base flags, no START/END), ends at 5088
    BATCH_OUTPUT: 5088,
    // 4 × 8 words × 4 bytes = 128 bytes (final output), ends at 5216
    // End of batch working area: 5216 bytes
    // WASM Arena: JS working buffers (accessed via TypedArray views)
    CV_STACK: 5216,
    // 64 levels × 8 words × 4 bytes = 2048 bytes, ends at 7264
    PARENT_BLOCK: 7264,
    // 16 words × 4 bytes = 64 bytes, ends at 7328
    CHUNK_CV: 7328,
    // 8 words × 4 bytes = 32 bytes, ends at 7360
    TEMP_CVS: 7360
    // 4 × 8 words × 4 bytes = 128 bytes, ends at 7488
    // Total arena usage: ~7488 bytes (fits comfortably in 64KB page)
  };
  var arenaCvStack = null;
  var arenaParentBlock = null;
  var arenaChunkCv = null;
  var arenaTempCvs = null;
  var arenaBatchBlockWords = null;
  var arenaBatchCv = null;
  var arenaBatchCounterLow = null;
  var arenaBatchFlagsBase = null;
  var arenaBatchOutput = null;

  // node_modules/@huggingface/blake3-jit/dist/esm/hash.js
  var CV_STACK_DEPTH = 64;
  var HYPER_CV_STACK = new Uint32Array(CV_STACK_DEPTH * 8);
  var CV_POOL_SIZE = 64;
  var CV_POOL = new Uint32Array(CV_POOL_SIZE * 8);
  var CV_VIEWS = [];
  for (let i = 0; i < CV_POOL_SIZE; i++) {
    CV_VIEWS.push(CV_POOL.subarray(i * 8, i * 8 + 8));
  }
  var simdAvailable = false;
  var SIMD_THRESHOLD = 4 * CHUNK_LEN;
  function ensureSimdSync() {
    if (simdAvailable)
      return true;
    simdAvailable = initSimdSync();
    return simdAvailable;
  }
  var simdChunkCvs = new Uint32Array(32);
  var reusableTempCv = new Uint32Array(8);
  var reusableChunkCv = new Uint32Array(8);
  var reusablePureParentBlock = new Uint32Array(16);
  var reusablePureParentCv = new Uint32Array(8);
  var reusableSimdCvs = new Uint32Array(32);
  var reusableSimdParentBlock = new Uint32Array(16);
  var reusableSimdParentCv = new Uint32Array(8);
  var reusableOffsets = new Uint32Array(4);
  var reusableCounters = new Uint32Array(4);
  var reusableBlockLens = new Uint32Array(4);
  var reusableFlags = new Uint32Array(4);
  var reusableOut8 = new Uint32Array(8);
  var reusableOut8View = new Uint8Array(reusableOut8.buffer, 0, 32);
  var SIMD_CV_BASE = SIMD_MEMORY.CHAINING_VALUES / 4;
  var SIMD_OUT_BASE = SIMD_MEMORY.OUTPUT / 4;
  var SIMD_COUNTER_LOW_BASE = SIMD_MEMORY.COUNTER_LOW / 4;
  var SIMD_COUNTER_HIGH_BASE = SIMD_MEMORY.COUNTER_HIGH / 4;
  var SIMD_BLOCK_LEN_BASE = SIMD_MEMORY.BLOCK_LEN / 4;
  var BATCH_CV_BASE = SIMD_MEMORY.BATCH_CV / 4;
  var BATCH_COUNTER_LOW_BASE = SIMD_MEMORY.BATCH_COUNTER_LOW / 4;
  var BATCH_FLAGS_BASE_OFFSET = SIMD_MEMORY.BATCH_FLAGS_BASE / 4;
  var BATCH_OUTPUT_BASE = SIMD_MEMORY.BATCH_OUTPUT / 4;
  var batchChunkOffsets = new Uint32Array(4);
  var SIMD_FLAGS_BASE = SIMD_MEMORY.FLAGS / 4;
  function warmupSimd() {
    return ensureSimdSync();
  }

  // node_modules/@huggingface/blake3-jit/dist/esm/index.js
  if (typeof globalThis !== "undefined" && typeof globalThis.document !== "undefined") {
    queueMicrotask(() => {
      warmupSimd();
    });
  }

  // node_modules/@huggingface/xetchunk-wasm/dist/esm/xet-chunker.js
  var TARGET_CHUNK_SIZE = 64 * 1024;
  var MINIMUM_CHUNK_DIVISOR = 8;
  var MAXIMUM_CHUNK_MULTIPLIER = 2;
  var HASH_WINDOW_SIZE = 64;
  var BLAKE3_DATA_KEY = new Uint8Array([
    102,
    151,
    245,
    119,
    91,
    149,
    80,
    222,
    49,
    53,
    203,
    172,
    165,
    151,
    24,
    28,
    157,
    228,
    33,
    16,
    155,
    235,
    43,
    88,
    180,
    208,
    176,
    75,
    147,
    173,
    242,
    41
  ]);
  var XetChunker = class {
    constructor(targetChunkSize = TARGET_CHUNK_SIZE) {
      __publicField(this, "minimumChunk");
      __publicField(this, "maximumChunk");
      __publicField(this, "chunkBuf");
      __publicField(this, "curChunkLen");
      __publicField(this, "gear");
      __publicField(this, "blake3");
      if (targetChunkSize <= 0) {
        throw new Error("Target chunk size must be greater than 0");
      }
      if ((targetChunkSize & targetChunkSize - 1) !== 0) {
        throw new Error("Target chunk size must be a power of 2");
      }
      if (targetChunkSize <= HASH_WINDOW_SIZE) {
        throw new Error("Target chunk size must be greater than hash window size");
      }
      if (targetChunkSize >= Number.MAX_SAFE_INTEGER) {
        throw new Error("Target chunk size must be less than Number.MAX_SAFE_INTEGER");
      }
      let mask = BigInt(targetChunkSize - 1);
      let leadingZeros = 0;
      for (let i = 63; i >= 0; i--) {
        if ((mask & 1n << BigInt(i)) !== 0n) {
          break;
        }
        leadingZeros++;
      }
      mask = mask << BigInt(leadingZeros);
      const maximumChunk = targetChunkSize * MAXIMUM_CHUNK_MULTIPLIER;
      this.minimumChunk = targetChunkSize / MINIMUM_CHUNK_DIVISOR;
      this.maximumChunk = maximumChunk;
      this.chunkBuf = new Uint8Array(maximumChunk);
      this.curChunkLen = 0;
      this.gear = new Hasher(mask);
      this.blake3 = Hasher2.newKeyed(BLAKE3_DATA_KEY);
    }
    /**
     * Streaming entry point: accepts an arbitrary slice of data, accumulates
     * it, and emits a chunk when a boundary (or max size) is reached.
     * Data is copied into an internal buffer because it may span calls.
     */
    next(data, isFinal) {
      const nBytes = data.length;
      let createChunk = false;
      let consumeLen = 0;
      if (nBytes !== 0) {
        if (this.curChunkLen + HASH_WINDOW_SIZE < this.minimumChunk) {
          const maxAdvance = Math.min(this.minimumChunk - this.curChunkLen - HASH_WINDOW_SIZE - 1, nBytes - consumeLen);
          consumeLen += maxAdvance;
          this.curChunkLen += maxAdvance;
        }
        const readEnd = Math.min(nBytes, consumeLen + this.maximumChunk - this.curChunkLen);
        let bytesToNextBoundary;
        const position = this.gear.nextMatch(data.subarray(consumeLen, readEnd));
        if (position !== -1) {
          bytesToNextBoundary = position;
          createChunk = true;
        } else {
          bytesToNextBoundary = readEnd - consumeLen;
        }
        if (bytesToNextBoundary + this.curChunkLen >= this.maximumChunk) {
          bytesToNextBoundary = this.maximumChunk - this.curChunkLen;
          createChunk = true;
        }
        this.curChunkLen += bytesToNextBoundary;
        consumeLen += bytesToNextBoundary;
        this.chunkBuf.set(data.subarray(0, consumeLen), this.curChunkLen - consumeLen);
      }
      if (createChunk || isFinal && this.curChunkLen > 0) {
        const chunkData = this.chunkBuf.subarray(0, this.curChunkLen);
        const hash3 = this.blake3.reset().update(chunkData).finalize(32);
        const chunk2 = {
          length: chunkData.length,
          hash: hash3
        };
        this.curChunkLen = 0;
        this.gear.resetHash();
        return {
          chunk: chunk2,
          bytesConsumed: consumeLen
        };
      }
      return {
        chunk: null,
        bytesConsumed: consumeLen
      };
    }
    /**
     * Batch entry point: processes a large contiguous buffer and returns all
     * complete chunks. Hashes directly from `data` — no intermediate copy
     * to chunkBuf — for every chunk whose bytes are fully within `data`.
     */
    nextBlock(data, isFinal) {
      const chunks = [];
      let pos = 0;
      while (pos < data.length && this.curChunkLen > 0) {
        const result = this.next(data.subarray(pos), false);
        if (result.chunk)
          chunks.push(result.chunk);
        pos += result.bytesConsumed;
      }
      const minSkip = this.minimumChunk > HASH_WINDOW_SIZE ? this.minimumChunk - HASH_WINDOW_SIZE - 1 : 0;
      while (pos < data.length) {
        const chunkStart = pos;
        const scanStart = Math.min(pos + minSkip, data.length);
        const scanEnd = Math.min(data.length, pos + this.maximumChunk);
        const position = this.gear.nextMatch(data.subarray(scanStart, scanEnd));
        let chunkEnd;
        let foundBoundary;
        if (position !== -1 && scanStart + position - chunkStart <= this.maximumChunk) {
          chunkEnd = scanStart + position;
          foundBoundary = true;
        } else if (scanEnd - chunkStart >= this.maximumChunk) {
          chunkEnd = chunkStart + this.maximumChunk;
          foundBoundary = true;
        } else {
          foundBoundary = false;
          chunkEnd = scanEnd;
        }
        if (foundBoundary) {
          const hash3 = this.blake3.reset().update(data.subarray(chunkStart, chunkEnd)).finalize(32);
          chunks.push({ length: chunkEnd - chunkStart, hash: hash3 });
          pos = chunkEnd;
          this.gear.resetHash();
        } else if (isFinal) {
          const hash3 = this.blake3.reset().update(data.subarray(chunkStart)).finalize(32);
          chunks.push({ length: data.length - chunkStart, hash: hash3 });
          pos = data.length;
        } else {
          this.chunkBuf.set(data.subarray(chunkStart), 0);
          this.curChunkLen = data.length - chunkStart;
          pos = data.length;
        }
      }
      return chunks;
    }
    finish() {
      if (this.curChunkLen > 0) {
        const chunkData = this.chunkBuf.subarray(0, this.curChunkLen);
        const hash3 = this.blake3.reset().update(chunkData).finalize(32);
        const chunk2 = { length: this.curChunkLen, hash: hash3 };
        this.curChunkLen = 0;
        this.gear.resetHash();
        return chunk2;
      }
      return null;
    }
  };
  function createChunker(targetChunkSize = TARGET_CHUNK_SIZE) {
    return new XetChunker(targetChunkSize);
  }
  function nextBlock(chunker, data) {
    return chunker.nextBlock(data, false);
  }
  function finalize(chunker) {
    return chunker.finish();
  }
  function hashToHex(hash3) {
    const view = new DataView(hash3.buffer, hash3.byteOffset, hash3.byteLength);
    const u64 = view.getBigUint64(0, true);
    const u64_2 = view.getBigUint64(8, true);
    const u64_3 = view.getBigUint64(16, true);
    const u64_4 = view.getBigUint64(24, true);
    return u64.toString(16).padStart(16, "0") + u64_2.toString(16).padStart(16, "0") + u64_3.toString(16).padStart(16, "0") + u64_4.toString(16).padStart(16, "0");
  }
  function hexToBytes(hex) {
    const bytes = new Uint8Array(32);
    const view = new DataView(bytes.buffer);
    view.setBigUint64(0, BigInt("0x" + hex.slice(0, 16)), true);
    view.setBigUint64(8, BigInt("0x" + hex.slice(16, 32)), true);
    view.setBigUint64(16, BigInt("0x" + hex.slice(32, 48)), true);
    view.setBigUint64(24, BigInt("0x" + hex.slice(48, 64)), true);
    return bytes;
  }

  // node_modules/@huggingface/xetchunk-wasm/dist/esm/xorb-hash.js
  var MEAN_CHUNK_PER_NODE = 4;
  var BLAKE3_NODE_KEY = new Uint8Array([
    1,
    126,
    197,
    199,
    165,
    71,
    41,
    150,
    253,
    148,
    102,
    102,
    180,
    138,
    2,
    230,
    93,
    221,
    83,
    111,
    55,
    199,
    109,
    210,
    248,
    99,
    82,
    230,
    74,
    83,
    113,
    63
  ]);
  var INDEX_OF_LAST_BYTE_OF_LAST_U64_IN_CHUNK_HASH = 3 * 8;
  var nodeHasher = Hasher2.newKeyed(BLAKE3_NODE_KEY);
  function isNaturalCut(hash3) {
    return hash3[INDEX_OF_LAST_BYTE_OF_LAST_U64_IN_CHUNK_HASH] % MEAN_CHUNK_PER_NODE === 0;
  }
  function xorbHash(chunks) {
    if (chunks.length === 0) {
      return new Uint8Array(32);
    }
    let currentChunks = chunks;
    while (currentChunks.length > 1) {
      const nodes = [];
      let currentIndex = 0;
      let numOfChildrenSoFar = 0;
      for (let i = 0; i < currentChunks.length; i++) {
        if (i === currentChunks.length - 1 || numOfChildrenSoFar === 2 * MEAN_CHUNK_PER_NODE || numOfChildrenSoFar >= 2 && currentChunks[i].hash[INDEX_OF_LAST_BYTE_OF_LAST_U64_IN_CHUNK_HASH] % MEAN_CHUNK_PER_NODE === 0) {
          nodes.push(mergedHashOfSequence(currentChunks.slice(currentIndex, i + 1)));
          currentIndex = i + 1;
          numOfChildrenSoFar = 0;
        } else {
          numOfChildrenSoFar++;
        }
      }
      currentChunks = nodes;
    }
    return currentChunks[0].hash;
  }
  function mergedHashOfSequence(chunks) {
    let text = "";
    let totalLength = 0;
    for (const chunk2 of chunks) {
      text += hashToHex(chunk2.hash) + " : " + chunk2.length + "\n";
      totalLength += chunk2.length;
    }
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i);
    }
    const hash3 = nodeHasher.reset().update(bytes).finalize(32);
    return { hash: hash3, length: totalLength };
  }

  // node_modules/@huggingface/xetchunk-wasm/dist/esm/hash-utils.js
  var ZERO_KEY = new Uint8Array(32);
  var VERIFICATION_KEY = new Uint8Array([
    127,
    24,
    87,
    214,
    206,
    86,
    237,
    102,
    18,
    127,
    249,
    19,
    231,
    165,
    195,
    243,
    164,
    205,
    38,
    213,
    181,
    219,
    73,
    230,
    65,
    36,
    152,
    127,
    40,
    251,
    148,
    195
  ]);
  var fileHasher = Hasher2.newKeyed(ZERO_KEY);
  var verificationHasher = Hasher2.newKeyed(VERIFICATION_KEY);
  function fileHash(chunks) {
    if (chunks.length === 0) {
      return new Uint8Array(32);
    }
    const xorb = xorbHash(chunks);
    return fileHasher.reset().update(xorb).finalize(32);
  }
  function hmac(hash3, key) {
    return Hasher2.newKeyed(key).update(hash3).finalize(32);
  }
  function verificationHash(chunkHashes) {
    const combined = new Uint8Array(chunkHashes.length * 32);
    for (let i = 0; i < chunkHashes.length; i++) {
      combined.set(chunkHashes[i], i * 32);
    }
    return verificationHasher.reset().update(combined).finalize(32);
  }

  // node_modules/@huggingface/xetchunk-wasm/dist/esm/merkle-hash-subtree.js
  var MIN_GROUP_SIZE = 2;
  var MAX_GROUP_SIZE = 9;
  function nextMergeCut(nodes, start, end) {
    const len = end - start;
    if (len <= MIN_GROUP_SIZE) {
      return len;
    }
    const lim = Math.min(MAX_GROUP_SIZE, len);
    for (let i = MIN_GROUP_SIZE; i < lim; i++) {
      if (isNaturalCut(nodes[start + i].hash)) {
        return i + 1;
      }
    }
    return lim;
  }
  function validGap(gap) {
    return gap > MIN_GROUP_SIZE && gap < MAX_GROUP_SIZE - 1;
  }
  function findStableStart(nodes) {
    if (nodes.length < MIN_GROUP_SIZE + 1) {
      return void 0;
    }
    let prevPrevCut;
    let prevCut;
    for (let pos = 0; pos < nodes.length; pos++) {
      if (!isNaturalCut(nodes[pos].hash)) {
        continue;
      }
      if (prevCut !== void 0 && validGap(pos - prevCut) && prevPrevCut !== void 0 && validGap(prevCut - prevPrevCut)) {
        return prevCut + 1;
      }
      prevPrevCut = prevCut;
      prevCut = pos;
    }
    return void 0;
  }
  function findStableEnd(nodes) {
    if (nodes.length < MIN_GROUP_SIZE + 1) {
      return void 0;
    }
    let nextNextCut;
    let nextCut;
    for (let pos = nodes.length - 1; pos >= 0; pos--) {
      if (!isNaturalCut(nodes[pos].hash)) {
        continue;
      }
      if (nextCut !== void 0 && validGap(nextCut - pos) && nextNextCut !== void 0 && validGap(nextNextCut - nextCut)) {
        return nextCut + 1;
      }
      nextNextCut = nextCut;
      nextCut = pos;
    }
    return void 0;
  }
  function splitAndPromote(nodes, atStart, atEnd, promoted) {
    if (nodes.length <= 1) {
      return [nodes.length, 0];
    }
    let stableStart;
    if (atStart) {
      stableStart = 0;
    } else {
      const idx = findStableStart(nodes);
      if (idx === void 0) {
        return [nodes.length, 0];
      }
      stableStart = idx;
    }
    let stableEnd;
    if (atEnd) {
      stableEnd = nodes.length;
    } else {
      const idx = findStableEnd(nodes.slice(stableStart));
      if (idx === void 0) {
        return [nodes.length, 0];
      }
      stableEnd = stableStart + idx;
    }
    if (stableStart >= stableEnd) {
      return [nodes.length, 0];
    }
    let pos = stableStart;
    while (pos < stableEnd) {
      const cutLen = nextMergeCut(nodes, pos, stableEnd);
      promoted.push(mergedHashOfSequence(nodes.slice(pos, pos + cutLen)));
      pos += cutLen;
    }
    return [stableStart, nodes.length - stableEnd];
  }
  function flattenHump(hump) {
    const nodes = [];
    for (const left of hump.leftLevels) {
      nodes.push(...left);
    }
    for (let level = hump.rightLevels.length - 1; level >= 0; level--) {
      nodes.push(...hump.rightLevels[level]);
    }
    const levels = hump.leftLevels.map((left, i) => [left.length, hump.rightLevels[i].length]);
    return { nodes, levels };
  }
  function buildHump(chunks, atStart, atEnd) {
    const leftLevels = [];
    const rightLevels = [];
    let current = chunks;
    let allLeftsEmpty = true;
    let allRightsEmpty = true;
    while (true) {
      const levelAtStart = atStart && allLeftsEmpty;
      const levelAtEnd = atEnd && allRightsEmpty;
      const promoted = [];
      const [prefixLen, suffixLen] = splitAndPromote(current, levelAtStart, levelAtEnd, promoted);
      leftLevels.push(current.slice(0, prefixLen));
      rightLevels.push(current.slice(current.length - suffixLen));
      if (prefixLen > 0) {
        allLeftsEmpty = false;
      }
      if (suffixLen > 0) {
        allRightsEmpty = false;
      }
      if (promoted.length === 0) {
        break;
      }
      if (promoted.length === 1) {
        leftLevels.push(promoted);
        rightLevels.push([]);
        break;
      }
      current = promoted;
    }
    return { leftLevels, rightLevels };
  }
  var MerkleHashSubtree = class _MerkleHashSubtree {
    constructor(nodes, levels, atStart, atEnd) {
      __publicField(this, "nodes");
      /** Per-level `[leftCount, rightCount]` pairs indexing into `nodes`. */
      __publicField(this, "levels");
      __publicField(this, "leftOffsets");
      __publicField(this, "rightOffsets");
      /** True if this range begins at chunk 0 of the full sequence. */
      __publicField(this, "atStart");
      /** True if this range ends at the last chunk of the full sequence. */
      __publicField(this, "atEnd");
      this.nodes = nodes;
      this.levels = levels;
      this.atStart = atStart;
      this.atEnd = atEnd;
      [this.leftOffsets, this.rightOffsets] = computeOffsets(levels);
    }
    /**
     * Create a subtree from a contiguous run of level-0 chunks.
     *
     * - `atStart`: `chunks[0]` is the first chunk of the entire file.
     * - `atEnd`: the last element of `chunks` is the file's final chunk.
     */
    static fromChunks(atStart, chunks, atEnd) {
      const { nodes, levels } = flattenHump(buildHump(chunks, atStart, atEnd));
      return new _MerkleHashSubtree(nodes, levels, atStart, atEnd);
    }
    get numNodes() {
      return this.nodes.length;
    }
    get numLevels() {
      return this.levels.length;
    }
    get isEmpty() {
      return this.nodes.length === 0;
    }
    leftAt(level) {
      if (level >= this.levels.length) {
        return [];
      }
      const start = this.leftOffsets[level];
      return this.nodes.slice(start, start + this.levels[level][0]);
    }
    rightAt(level) {
      if (level >= this.levels.length) {
        return [];
      }
      const start = this.rightOffsets[level];
      return this.nodes.slice(start, start + this.levels[level][1]);
    }
    /**
     * Merge an adjacent subtree (the right neighbor) into this one, in place.
     * After the call, `this` covers the combined range: it keeps its own
     * `atStart` and takes `other`'s `atEnd`.
     *
     * Throws if `this.atEnd` (nothing can follow the end) or `other.atStart`
     * (the start cannot appear on the right side of a merge).
     */
    mergeInto(other) {
      if (this.atEnd) {
        throw new Error("Cannot merge into a subtree that is already at the end");
      }
      if (other.atStart) {
        throw new Error("Cannot merge a subtree that is at the start on the right side");
      }
      const combinedAtStart = this.atStart;
      const combinedAtEnd = other.atEnd;
      const maxLevels = Math.max(this.numLevels, other.numLevels);
      const leftLevels = [];
      const rightLevels = [];
      let carry = [];
      let allLeftsEmpty = true;
      let allRightsEmpty = true;
      for (let level = 0; level < maxLevels; level++) {
        const full = [
          ...this.leftAt(level),
          ...this.rightAt(level),
          ...carry,
          ...other.leftAt(level),
          ...other.rightAt(level)
        ];
        const levelAtStart = combinedAtStart && allLeftsEmpty;
        const levelAtEnd = combinedAtEnd && allRightsEmpty;
        const promoted = [];
        const [prefixLen, suffixLen] = splitAndPromote(full, levelAtStart, levelAtEnd, promoted);
        leftLevels.push(full.slice(0, prefixLen));
        rightLevels.push(full.slice(full.length - suffixLen));
        if (prefixLen > 0) {
          allLeftsEmpty = false;
        }
        if (suffixLen > 0) {
          allRightsEmpty = false;
        }
        carry = promoted;
      }
      while (carry.length > 0) {
        if (carry.length === 1) {
          leftLevels.push(carry);
          rightLevels.push([]);
          carry = [];
        } else {
          const promoted = [];
          const [prefixLen, suffixLen] = splitAndPromote(carry, combinedAtStart && allLeftsEmpty, combinedAtEnd && allRightsEmpty, promoted);
          leftLevels.push(carry.slice(0, prefixLen));
          rightLevels.push(carry.slice(carry.length - suffixLen));
          if (prefixLen > 0) {
            allLeftsEmpty = false;
          }
          if (suffixLen > 0) {
            allRightsEmpty = false;
          }
          carry = promoted;
        }
      }
      while (leftLevels.length > 1 && leftLevels[leftLevels.length - 1].length === 0 && rightLevels[rightLevels.length - 1].length === 0) {
        leftLevels.pop();
        rightLevels.pop();
      }
      const { nodes, levels } = flattenHump({ leftLevels, rightLevels });
      this.nodes = nodes;
      this.levels = levels;
      [this.leftOffsets, this.rightOffsets] = computeOffsets(levels);
      this.atStart = combinedAtStart;
      this.atEnd = combinedAtEnd;
    }
    /**
     * Merge multiple adjacent ranges left-to-right.
     * Returns an empty fully-closed range when `ranges` is empty.
     */
    static merge(ranges) {
      if (ranges.length === 0) {
        return _MerkleHashSubtree.fromChunks(true, [], true);
      }
      const result = ranges[0].clone();
      for (let i = 1; i < ranges.length; i++) {
        result.mergeInto(ranges[i]);
      }
      return result;
    }
    clone() {
      return new _MerkleHashSubtree([...this.nodes], this.levels.map((l) => [...l]), this.atStart, this.atEnd);
    }
    /**
     * The final aggregated hash — only available when both boundaries are
     * known (`atStart && atEnd`). Equals `xorbHash(allChunks)`; apply
     * `hmac(hash, zeroKey)` to obtain the file hash.
     *
     * Returns `undefined` when either boundary is unknown.
     */
    finalHash() {
      if (!this.atStart || !this.atEnd) {
        return void 0;
      }
      if (this.nodes.length === 0) {
        return new Uint8Array(32);
      }
      const top = this.levels.length - 1;
      const topLeft = this.leftAt(top);
      if (topLeft.length !== 1 || this.rightAt(top).length !== 0) {
        throw new Error("Invariant violation: fully-closed hump should have a single node at the top level");
      }
      return topLeft[0].hash;
    }
    /** Total byte length covered by this subtree. */
    get totalLength() {
      let total = 0;
      for (let level = 0; level < this.levels.length; level++) {
        for (const node of this.leftAt(level)) {
          total += node.length;
        }
        for (const node of this.rightAt(level)) {
          total += node.length;
        }
      }
      return total;
    }
    /** Serde-human-readable-compatible JSON (what the CAS server produces/accepts). */
    toJSON() {
      return {
        nodes: this.nodes.map((node) => ({ hash: hashToHex(node.hash), size: node.length })),
        levels: this.levels.map((l) => [...l]),
        at_start: this.atStart,
        at_end: this.atEnd
      };
    }
    static fromJSON(json) {
      return new _MerkleHashSubtree(json.nodes.map((node) => ({ hash: hexToBytes(node.hash), length: node.size })), json.levels.map((l) => [l[0], l[1]]), json.at_start, json.at_end);
    }
  };
  function computeOffsets(levels) {
    const leftOffsets = [];
    const rightOffsets = [];
    let cumulativeLeft = 0;
    for (const [leftCount] of levels) {
      leftOffsets.push(cumulativeLeft);
      cumulativeLeft += leftCount;
    }
    const totalLeft = cumulativeLeft;
    let cumulativeRightAfter = 0;
    for (const [, rightCount] of levels) {
      cumulativeRightAfter += rightCount;
    }
    for (const [, rightCount] of levels) {
      cumulativeRightAfter -= rightCount;
      rightOffsets.push(totalLeft + cumulativeRightAfter);
    }
    return [leftOffsets, rightOffsets];
  }

  // node_modules/@huggingface/hub/dist/browser/index.mjs
  var HUB_URL = "https://huggingface.co";
  async function createApiError(response, opts) {
    const error = new HubApiError(response.url, response.status, response.headers.get("X-Request-Id") ?? opts?.requestId);
    error.message = `Api error with status ${error.statusCode}${opts?.message ? `. ${opts.message}` : ""}`;
    const trailer = [`URL: ${error.url}`, error.requestId ? `Request ID: ${error.requestId}` : void 0].filter(Boolean).join(". ");
    if (response.headers.get("Content-Type")?.startsWith("application/json")) {
      const json = await response.json();
      error.message = json.error || json.message || error.message;
      if (json.error_description) {
        error.message = error.message ? error.message + `: ${json.error_description}` : json.error_description;
      }
      error.data = json;
    } else {
      error.data = { message: await response.text() };
    }
    error.message += `. ${trailer}`;
    throw error;
  }
  var HubApiError = class extends Error {
    constructor(url, statusCode, requestId, message) {
      super(message);
      __publicField(this, "statusCode");
      __publicField(this, "url");
      __publicField(this, "requestId");
      __publicField(this, "data");
      this.statusCode = statusCode;
      this.requestId = requestId;
      this.url = url;
    }
  };
  var InvalidApiResponseFormatError = class extends Error {
  };
  function checkAccessToken(accessToken) {
    if (!accessToken.startsWith("hf_")) {
      throw new TypeError("Your access token must start with 'hf_'");
    }
  }
  function checkCredentials(params) {
    if (params.accessToken) {
      checkAccessToken(params.accessToken);
      return params.accessToken;
    }
    if (params.credentials?.accessToken) {
      checkAccessToken(params.credentials.accessToken);
      return params.credentials.accessToken;
    }
  }
  function toRepoId(repo) {
    if (typeof repo !== "string") {
      return repo;
    }
    if (repo.startsWith("model/") || repo.startsWith("models/")) {
      throw new TypeError(
        "A repo designation for a model should not start with 'models/', directly specify the model namespace / name"
      );
    }
    if (repo.startsWith("space/")) {
      throw new TypeError("Spaces should start with 'spaces/', plural, not 'space/'");
    }
    if (repo.startsWith("dataset/")) {
      throw new TypeError("Datasets should start with 'datasets/', plural, not 'dataset/'");
    }
    if (repo.startsWith("bucket/")) {
      throw new TypeError("Buckets should start with 'buckets/', plural, not 'bucket/'");
    }
    if (repo.startsWith("kernel/")) {
      throw new TypeError("Kernels should start with 'kernels/', plural, not 'kernel/'");
    }
    const slashes = repo.split("/").length - 1;
    if (repo.startsWith("spaces/")) {
      if (slashes !== 2) {
        throw new TypeError("Space Id must include namespace and name of the space");
      }
      return {
        type: "space",
        name: repo.slice("spaces/".length)
      };
    }
    if (repo.startsWith("datasets/")) {
      if (slashes > 2) {
        throw new TypeError("Too many slashes in repo designation: " + repo);
      }
      return {
        type: "dataset",
        name: repo.slice("datasets/".length)
      };
    }
    if (repo.startsWith("buckets/")) {
      if (slashes !== 2) {
        throw new TypeError("Bucket Id must include namespace and name of the bucket");
      }
      return {
        type: "bucket",
        name: repo.slice("buckets/".length)
      };
    }
    if (repo.startsWith("kernels/")) {
      if (slashes !== 2) {
        throw new TypeError("Kernel Id must include namespace and name of the kernel");
      }
      return {
        type: "kernel",
        name: repo.slice("kernels/".length)
      };
    }
    if (slashes > 1) {
      throw new TypeError("Too many slashes in repo designation: " + repo);
    }
    return {
      type: "model",
      name: repo
    };
  }
  async function checkRepoAccess(params) {
    const accessToken = params && checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const response = await (params.fetch || fetch)(`${params?.hubUrl || HUB_URL}/api/${repoId.type}s/${repoId.name}`, {
      headers: {
        ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      }
    });
    if (!response.ok) {
      throw await createApiError(response);
    }
  }
  function range(n, b) {
    return b ? Array(b - n).fill(0).map((_, i) => n + i) : Array(n).fill(0).map((_, i) => i);
  }
  function chunk(arr, chunkSize) {
    if (isNaN(chunkSize) || chunkSize < 1) {
      throw new RangeError("Invalid chunk size: " + chunkSize);
    }
    if (!arr.length) {
      return [];
    }
    if (arr.length <= chunkSize) {
      return [arr];
    }
    return range(Math.ceil(arr.length / chunkSize)).map((i) => {
      return arr.slice(i * chunkSize, (i + 1) * chunkSize);
    });
  }
  async function promisesQueue(factories, concurrency) {
    const results = [];
    const executing = /* @__PURE__ */ new Set();
    let index = 0;
    for (const factory of factories) {
      const closureIndex = index++;
      const e = factory().then((r) => {
        results[closureIndex] = r;
        executing.delete(e);
      });
      executing.add(e);
      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);
    return results;
  }
  async function promisesQueueStreaming(factories, concurrency) {
    const executing = [];
    for await (const factory of factories) {
      const e = factory().then(() => {
        executing.splice(executing.indexOf(e), 1);
      });
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);
  }
  async function* eventToGenerator(cb) {
    const promises = [];
    function addPromise() {
      let resolve2;
      let reject;
      const p = new Promise((res, rej) => {
        resolve2 = res;
        reject = rej;
      });
      promises.push({ p, resolve: resolve2, reject });
    }
    addPromise();
    const callbackRes = Promise.resolve().then(
      () => cb(
        (y) => {
          addPromise();
          promises.at(-2)?.resolve({ done: false, value: y });
        },
        (r) => {
          addPromise();
          promises.at(-2)?.resolve({ done: true, value: r });
        },
        (err) => promises.shift()?.reject(err)
      )
    ).catch((err) => promises.shift()?.reject(err));
    while (1) {
      const p = promises[0];
      if (!p) {
        throw new Error("Logic error in eventGenerator, promises should never be empty");
      }
      const result = await p.p;
      promises.shift();
      if (result.done) {
        await callbackRes;
        return result.value;
      }
      yield result.value;
    }
    throw new Error("Unreachable");
  }
  function hexFromBytes(arr) {
    if (globalThis.Buffer) {
      return globalThis.Buffer.from(arr).toString("hex");
    } else {
      const bin = [];
      arr.forEach((byte) => {
        bin.push(byte.toString(16).padStart(2, "0"));
      });
      return bin.join("");
    }
  }
  var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
  var isWebWorker = typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";
  var isBackend = !isBrowser && !isWebWorker;
  var isFrontend = !isBackend;
  async function getWebWorkerCode() {
    const sha256Module = await Promise.resolve().then(() => (init_sha256_wrapper_DYTB3MXW(), sha256_wrapper_DYTB3MXW_exports));
    return URL.createObjectURL(new Blob([sha256Module.createSHA256WorkerCode()]));
  }
  var pendingWorkers = [];
  var runningWorkers = /* @__PURE__ */ new Set();
  var resolve;
  var waitPromise = new Promise((r) => {
    resolve = r;
  });
  async function getWorker(poolSize) {
    {
      const worker2 = pendingWorkers.pop();
      if (worker2) {
        runningWorkers.add(worker2);
        return worker2;
      }
    }
    if (!poolSize) {
      const worker2 = new Worker(await getWebWorkerCode());
      runningWorkers.add(worker2);
      return worker2;
    }
    if (poolSize <= 0) {
      throw new TypeError("Invalid webworker pool size: " + poolSize);
    }
    while (runningWorkers.size >= poolSize) {
      await waitPromise;
    }
    const worker = new Worker(await getWebWorkerCode());
    runningWorkers.add(worker);
    return worker;
  }
  async function freeWorker(worker, poolSize) {
    if (!poolSize) {
      return destroyWorker(worker);
    }
    runningWorkers.delete(worker);
    pendingWorkers.push(worker);
    const r = resolve;
    waitPromise = new Promise((r2) => {
      resolve = r2;
    });
    r();
  }
  function destroyWorker(worker) {
    runningWorkers.delete(worker);
    worker.terminate();
    const r = resolve;
    waitPromise = new Promise((r2) => {
      resolve = r2;
    });
    r();
  }
  async function* sha256(buffer, opts) {
    yield 0;
    const maxCryptoSize = typeof opts?.useWebWorker === "object" && opts?.useWebWorker.minSize !== void 0 ? opts.useWebWorker.minSize : 1e7;
    if (buffer.size < maxCryptoSize && globalThis.crypto?.subtle) {
      const res = hexFromBytes(
        new Uint8Array(
          await globalThis.crypto.subtle.digest("SHA-256", buffer instanceof Blob ? await buffer.arrayBuffer() : buffer)
        )
      );
      yield 1;
      return res;
    }
    if (isFrontend) {
      if (opts?.useWebWorker) {
        try {
          const poolSize = typeof opts?.useWebWorker === "object" ? opts.useWebWorker.poolSize : void 0;
          const worker = await getWorker(poolSize);
          let messageHandler;
          let errorHandler;
          let abortListener;
          const cleanup = () => {
            worker.removeEventListener("message", messageHandler);
            worker.removeEventListener("error", errorHandler);
            if (abortListener) {
              opts?.abortSignal?.removeEventListener("abort", abortListener);
            }
          };
          return yield* eventToGenerator((yieldCallback, returnCallback, rejectCallback) => {
            messageHandler = (event) => {
              if (event.data.sha256) {
                cleanup();
                freeWorker(worker, poolSize);
                returnCallback(event.data.sha256);
              } else if (event.data.progress) {
                yieldCallback(event.data.progress);
                try {
                  opts.abortSignal?.throwIfAborted();
                } catch (err) {
                  cleanup();
                  destroyWorker(worker);
                  rejectCallback(err);
                }
              } else {
                cleanup();
                destroyWorker(worker);
                rejectCallback(event);
              }
            };
            errorHandler = (event) => {
              cleanup();
              destroyWorker(worker);
              rejectCallback(event.error);
            };
            if (opts?.abortSignal) {
              try {
                opts.abortSignal?.throwIfAborted();
              } catch (err) {
                cleanup();
                destroyWorker(worker);
                rejectCallback(opts.abortSignal.reason ?? new DOMException("Aborted", "AbortError"));
                return;
              }
              abortListener = () => {
                cleanup();
                destroyWorker(worker);
                rejectCallback(opts.abortSignal?.reason ?? new DOMException("Aborted", "AbortError"));
              };
              opts.abortSignal.addEventListener("abort", abortListener);
            }
            worker.addEventListener("message", messageHandler);
            worker.addEventListener("error", errorHandler);
            worker.postMessage({ file: buffer });
          });
        } catch (err) {
          console.warn("Failed to use web worker for sha256", err);
        }
      }
      if (!wasmModule) {
        wasmModule = await Promise.resolve().then(() => (init_sha256_wrapper_DYTB3MXW(), sha256_wrapper_DYTB3MXW_exports));
      }
      const sha2562 = await wasmModule.createSHA256();
      sha2562.init();
      const reader = buffer.stream().getReader();
      const total = buffer.size;
      let bytesDone = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        sha2562.update(value);
        bytesDone += value.length;
        yield bytesDone / total;
        opts?.abortSignal?.throwIfAborted();
      }
      return sha2562.digest("hex");
    }
    if (!cryptoModule) {
      cryptoModule = await Promise.resolve().then(() => (init_sha256_node_TNZ2WHTI(), sha256_node_TNZ2WHTI_exports));
    }
    return yield* cryptoModule.sha256Node(buffer, { abortSignal: opts?.abortSignal });
  }
  var cryptoModule;
  var wasmModule;
  var WebBlob = class extends Blob {
    constructor(url, start, end, contentType, full, customFetch, accessToken) {
      super([]);
      __publicField(this, "url");
      __publicField(this, "start");
      __publicField(this, "end");
      __publicField(this, "contentType");
      __publicField(this, "full");
      __publicField(this, "fetch");
      __publicField(this, "accessToken");
      this.url = url;
      this.start = start;
      this.end = end;
      this.contentType = contentType;
      this.full = full;
      this.fetch = customFetch;
      this.accessToken = accessToken;
    }
    static async create(url, opts) {
      const customFetch = opts?.fetch ?? fetch;
      const probe = await customFetch(url, {
        headers: {
          Range: "bytes=0-0",
          ...opts?.accessToken && { Authorization: `Bearer ${opts.accessToken}` }
        }
      });
      if (!probe.ok) {
        throw await createApiError(probe);
      }
      const contentType = probe.headers.get("content-type") || "";
      if (probe.status === 206) {
        const totalSize = Number(probe.headers.get("content-range")?.split("/").pop());
        await probe.body?.cancel();
        if (Number.isFinite(totalSize) && totalSize >= (opts?.cacheBelow ?? 1e6)) {
          return new WebBlob(url, 0, totalSize, contentType, true, customFetch, opts?.accessToken);
        }
        const full = await customFetch(url, {
          ...opts?.accessToken && { headers: { Authorization: `Bearer ${opts.accessToken}` } }
        });
        if (!full.ok) {
          throw await createApiError(full);
        }
        return full.blob();
      }
      return probe.blob();
    }
    get size() {
      return this.end - this.start;
    }
    get type() {
      return this.contentType;
    }
    slice(start = 0, end = this.size) {
      if (start < 0 || end < 0) {
        throw new TypeError("Unsupported negative start/end on WebBlob.slice");
      }
      const slice = new WebBlob(
        this.url,
        this.start + start,
        Math.min(this.start + end, this.end),
        this.contentType,
        start === 0 && end === this.size ? this.full : false,
        this.fetch,
        this.accessToken
      );
      return slice;
    }
    async arrayBuffer() {
      const result = await this.fetchRange();
      return result.arrayBuffer();
    }
    async text() {
      const result = await this.fetchRange();
      return result.text();
    }
    stream() {
      const stream = new TransformStream();
      this.fetchRange().then((response) => response.body?.pipeThrough(stream)).catch((error) => stream.writable.abort(error.message));
      return stream.readable;
    }
    fetchRange() {
      const fetch2 = this.fetch;
      if (this.full) {
        return fetch2(this.url, {
          ...this.accessToken && {
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          }
        }).then((resp) => resp.ok ? resp : createApiError(resp));
      }
      return fetch2(this.url, {
        headers: {
          Range: `bytes=${this.start}-${this.end - 1}`,
          ...this.accessToken && { Authorization: `Bearer ${this.accessToken}` }
        }
      }).then((resp) => resp.ok ? resp : createApiError(resp));
    }
  };
  function base64FromBytes(arr) {
    if (globalThis.Buffer) {
      return globalThis.Buffer.from(arr).toString("base64");
    } else {
      const bin = [];
      arr.forEach((byte) => {
        bin.push(String.fromCharCode(byte));
      });
      return globalThis.btoa(bin.join(""));
    }
  }
  async function createBlobs(url, destPath, opts) {
    if (url.protocol === "http:" || url.protocol === "https:") {
      const blob = await WebBlob.create(url, { fetch: opts?.fetch, accessToken: opts?.accessToken });
      return [{ path: destPath, blob }];
    }
    if (isFrontend) {
      throw new TypeError(`Unsupported URL protocol "${url.protocol}"`);
    }
    if (url.protocol === "file:") {
      const { FileBlob } = await Promise.resolve().then(() => (init_FileBlob_7MRLQ6TG(), FileBlob_7MRLQ6TG_exports));
      const { subPaths } = await Promise.resolve().then(() => (init_sub_paths_F6TP7MGR(), sub_paths_F6TP7MGR_exports));
      const paths = await subPaths(url, opts?.maxFolderDepth);
      if (paths.length === 1 && paths[0].relativePath === ".") {
        const blob = await FileBlob.create(url);
        return [{ path: destPath, blob }];
      }
      return Promise.all(
        paths.map(async (path) => ({
          path: `${destPath}/${path.relativePath}`.replace(/\/[.]$/, "").replaceAll("//", "/").replace(/^[.]?\//, ""),
          blob: await FileBlob.create(new URL(path.path))
        }))
      );
    }
    throw new TypeError(`Unsupported URL protocol "${url.protocol}"`);
  }
  function combineUint8Arrays(...arrays) {
    const totalLength = arrays.reduce((sum2, array) => sum2 + array.length, 0);
    const combinedBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const array of arrays) {
      combinedBytes.set(array, offset);
      offset += array.length;
    }
    return combinedBytes;
  }
  function hashU32(a) {
    a = a | 0;
    a = a + 2127912214 + (a << 12) | 0;
    a = a ^ -949894596 ^ a >>> 19;
    a = a + 374761393 + (a << 5) | 0;
    a = a + -744332180 ^ a << 9;
    a = a + -42973499 + (a << 3) | 0;
    return a ^ -1252372727 ^ a >>> 16 | 0;
  }
  function readU64(b, n) {
    let x = 0;
    x |= b[n++] << 0;
    x |= b[n++] << 8;
    x |= b[n++] << 16;
    x |= b[n++] << 24;
    x |= b[n++] << 32;
    x |= b[n++] << 40;
    x |= b[n++] << 48;
    x |= b[n++] << 56;
    return x;
  }
  function readU32(b, n) {
    let x = 0;
    x |= b[n++] << 0;
    x |= b[n++] << 8;
    x |= b[n++] << 16;
    x |= b[n++] << 24;
    return x;
  }
  function writeU32(b, n, x) {
    b[n++] = x >> 0 & 255;
    b[n++] = x >> 8 & 255;
    b[n++] = x >> 16 & 255;
    b[n++] = x >> 24 & 255;
  }
  function imul(a, b) {
    const ah = a >>> 16;
    const al = a & 65535;
    const bh = b >>> 16;
    const bl = b & 65535;
    return al * bl + (ah * bl + al * bh << 16) | 0;
  }
  var prime1 = 2654435761;
  var prime2 = 2246822519;
  var prime3 = 3266489917;
  var prime4 = 668265263;
  var prime5 = 374761393;
  function rotl32(x, r) {
    x = x | 0;
    r = r | 0;
    return x >>> (32 - r | 0) | x << r | 0;
  }
  function rotmul32(h, r, m) {
    h = h | 0;
    r = r | 0;
    m = m | 0;
    return imul(h >>> (32 - r | 0) | h << r, m) | 0;
  }
  function shiftxor32(h, s) {
    h = h | 0;
    s = s | 0;
    return h >>> s ^ h | 0;
  }
  function xxhapply(h, src, m0, s, m1) {
    return rotmul32(imul(src, m0) + h, s, m1);
  }
  function xxh1(h, src, index) {
    return rotmul32(h + imul(src[index], prime5), 11, prime1);
  }
  function xxh4(h, src, index) {
    return xxhapply(h, readU32(src, index), prime3, 17, prime4);
  }
  function xxh16(h, src, index) {
    return [
      xxhapply(h[0], readU32(src, index + 0), prime2, 13, prime1),
      xxhapply(h[1], readU32(src, index + 4), prime2, 13, prime1),
      xxhapply(h[2], readU32(src, index + 8), prime2, 13, prime1),
      xxhapply(h[3], readU32(src, index + 12), prime2, 13, prime1)
    ];
  }
  function xxh32(seed, src, index, len) {
    let h;
    const l = len;
    if (len >= 16) {
      h = [seed + prime1 + prime2, seed + prime2, seed, seed - prime1];
      while (len >= 16) {
        h = xxh16(h, src, index);
        index += 16;
        len -= 16;
      }
      h = rotl32(h[0], 1) + rotl32(h[1], 7) + rotl32(h[2], 12) + rotl32(h[3], 18) + l;
    } else {
      h = seed + prime5 + len >>> 0;
    }
    while (len >= 4) {
      h = xxh4(h, src, index);
      index += 4;
      len -= 4;
    }
    while (len > 0) {
      h = xxh1(h, src, index);
      index++;
      len--;
    }
    h = shiftxor32(imul(shiftxor32(imul(shiftxor32(h, 15), prime2), 13), prime3), 16);
    return h >>> 0;
  }
  var hash2 = xxh32;
  var minMatch = 4;
  var matchSearchLimit = 12;
  var minTrailingLitterals = 5;
  var skipTrigger = 6;
  var hashSize = 1 << 16;
  var mlBits = 4;
  var mlMask = (1 << mlBits) - 1;
  var runBits = 4;
  var runMask = (1 << runBits) - 1;
  var blockBuf = makeBuffer(5 << 20);
  var hashTable = makeHashTable();
  var magicNum = 407708164;
  var fdContentChksum = 4;
  var fdContentSize = 8;
  var fdBlockChksum = 16;
  var fdVersion = 64;
  var fdVersionMask = 192;
  var bsUncompressed = 2147483648;
  var bsDefault = 7;
  var bsShift = 4;
  var bsMask = 7;
  var bsMap = {
    4: 65536,
    5: 262144,
    6: 1048576,
    7: 4194304
  };
  function makeHashTable() {
    try {
      return new Uint32Array(hashSize);
    } catch (error) {
      const hashTable2 = new Array(hashSize);
      for (let i = 0; i < hashSize; i++) {
        hashTable2[i] = 0;
      }
      return hashTable2;
    }
  }
  function clearHashTable(table) {
    for (let i = 0; i < hashSize; i++) {
      table[i] = 0;
    }
  }
  function makeBuffer(size) {
    return new Uint8Array(size);
  }
  function sliceArray(array, start, end) {
    return array.slice(start, end);
  }
  function compressBound(n) {
    return n + n / 255 + 16 | 0;
  }
  function decompressBound(src) {
    let sIndex = 0;
    if (readU32(src, sIndex) !== magicNum) {
      throw new Error("invalid magic number");
    }
    sIndex += 4;
    const descriptor = src[sIndex++];
    if ((descriptor & fdVersionMask) !== fdVersion) {
      throw new Error("incompatible descriptor version " + (descriptor & fdVersionMask));
    }
    const useBlockSum = (descriptor & fdBlockChksum) !== 0;
    const useContentSize = (descriptor & fdContentSize) !== 0;
    const bsIdx = src[sIndex++] >> bsShift & bsMask;
    if (bsMap[bsIdx] === void 0) {
      throw new Error("invalid block size " + bsIdx);
    }
    const maxBlockSize = bsMap[bsIdx];
    if (useContentSize) {
      return readU64(src, sIndex);
    }
    sIndex++;
    let maxSize = 0;
    while (true) {
      let blockSize = readU32(src, sIndex);
      sIndex += 4;
      if (blockSize & bsUncompressed) {
        blockSize &= ~bsUncompressed;
        maxSize += blockSize;
      } else if (blockSize > 0) {
        maxSize += maxBlockSize;
      }
      if (blockSize === 0) {
        return maxSize;
      }
      if (useBlockSum) {
        sIndex += 4;
      }
      sIndex += blockSize;
    }
  }
  function decompressBlock(src, dst, sIndex, sLength, dIndex) {
    let mLength, mOffset, sEnd, n, i;
    const hasCopyWithin = dst.copyWithin !== void 0 && dst.fill !== void 0;
    sEnd = sIndex + sLength;
    while (sIndex < sEnd) {
      const token = src[sIndex++];
      let literalCount = token >> 4;
      if (literalCount > 0) {
        if (literalCount === 15) {
          while (true) {
            literalCount += src[sIndex];
            if (src[sIndex++] !== 255) {
              break;
            }
          }
        }
        for (n = sIndex + literalCount; sIndex < n; ) {
          dst[dIndex++] = src[sIndex++];
        }
      }
      if (sIndex >= sEnd) {
        break;
      }
      mLength = token & 15;
      mOffset = src[sIndex++] | src[sIndex++] << 8;
      if (mLength === 15) {
        while (true) {
          mLength += src[sIndex];
          if (src[sIndex++] !== 255) {
            break;
          }
        }
      }
      mLength += minMatch;
      if (hasCopyWithin && mOffset === 1) {
        dst.fill(dst[dIndex - 1] | 0, dIndex, dIndex + mLength);
        dIndex += mLength;
      } else if (hasCopyWithin && mOffset > mLength && mLength > 31) {
        dst.copyWithin(dIndex, dIndex - mOffset, dIndex - mOffset + mLength);
        dIndex += mLength;
      } else {
        for (i = dIndex - mOffset, n = i + mLength; i < n; ) {
          dst[dIndex++] = dst[i++] | 0;
        }
      }
    }
    return dIndex;
  }
  function compressBlock(src, dst, sIndex, sLength, hashTable2) {
    let mIndex, mAnchor, mLength, mOffset, mStep;
    let literalCount, dIndex, sEnd, n;
    dIndex = 0;
    sEnd = sLength + sIndex;
    mAnchor = sIndex;
    let searchMatchCount = (1 << skipTrigger) + 3;
    while (sIndex <= sEnd - matchSearchLimit) {
      const seq = readU32(src, sIndex);
      let hash22 = hashU32(seq) >>> 0;
      hash22 = (hash22 >> 16 ^ hash22) >>> 0 & 65535;
      mIndex = hashTable2[hash22] - 1;
      hashTable2[hash22] = sIndex + 1;
      if (mIndex < 0 || sIndex - mIndex >>> 16 > 0 || readU32(src, mIndex) !== seq) {
        mStep = searchMatchCount++ >> skipTrigger;
        sIndex += mStep;
        continue;
      }
      searchMatchCount = (1 << skipTrigger) + 3;
      literalCount = sIndex - mAnchor;
      mOffset = sIndex - mIndex;
      sIndex += minMatch;
      mIndex += minMatch;
      mLength = sIndex;
      while (sIndex < sEnd - minTrailingLitterals && src[sIndex] === src[mIndex]) {
        sIndex++;
        mIndex++;
      }
      mLength = sIndex - mLength;
      const token = mLength < mlMask ? mLength : mlMask;
      if (literalCount >= runMask) {
        dst[dIndex++] = (runMask << mlBits) + token;
        for (n = literalCount - runMask; n >= 255; n -= 255) {
          dst[dIndex++] = 255;
        }
        dst[dIndex++] = n;
      } else {
        dst[dIndex++] = (literalCount << mlBits) + token;
      }
      for (let i = 0; i < literalCount; i++) {
        dst[dIndex++] = src[mAnchor + i];
      }
      dst[dIndex++] = mOffset;
      dst[dIndex++] = mOffset >> 8;
      if (mLength >= mlMask) {
        for (n = mLength - mlMask; n >= 255; n -= 255) {
          dst[dIndex++] = 255;
        }
        dst[dIndex++] = n;
      }
      mAnchor = sIndex;
    }
    if (mAnchor === 0) {
      return 0;
    }
    literalCount = sEnd - mAnchor;
    if (literalCount >= runMask) {
      dst[dIndex++] = runMask << mlBits;
      for (n = literalCount - runMask; n >= 255; n -= 255) {
        dst[dIndex++] = 255;
      }
      dst[dIndex++] = n;
    } else {
      dst[dIndex++] = literalCount << mlBits;
    }
    sIndex = mAnchor;
    while (sIndex < sEnd) {
      dst[dIndex++] = src[sIndex++];
    }
    return dIndex;
  }
  function decompressFrame(src, dst) {
    let useBlockSum, useContentSum, useContentSize, descriptor;
    let sIndex = 0;
    let dIndex = 0;
    if (readU32(src, sIndex) !== magicNum) {
      throw new Error("invalid magic number");
    }
    sIndex += 4;
    descriptor = src[sIndex++];
    if ((descriptor & fdVersionMask) !== fdVersion) {
      throw new Error("incompatible descriptor version");
    }
    useBlockSum = (descriptor & fdBlockChksum) !== 0;
    useContentSum = (descriptor & fdContentChksum) !== 0;
    useContentSize = (descriptor & fdContentSize) !== 0;
    const bsIdx = src[sIndex++] >> bsShift & bsMask;
    if (bsMap[bsIdx] === void 0) {
      throw new Error("invalid block size");
    }
    if (useContentSize) {
      sIndex += 8;
    }
    sIndex++;
    while (true) {
      var compSize;
      compSize = readU32(src, sIndex);
      sIndex += 4;
      if (compSize === 0) {
        break;
      }
      if (useBlockSum) {
        sIndex += 4;
      }
      if ((compSize & bsUncompressed) !== 0) {
        compSize &= ~bsUncompressed;
        for (let j = 0; j < compSize; j++) {
          dst[dIndex++] = src[sIndex++];
        }
      } else {
        dIndex = decompressBlock(src, dst, sIndex, compSize, dIndex);
        sIndex += compSize;
      }
    }
    if (useContentSum) {
      sIndex += 4;
    }
    return dIndex;
  }
  function compressFrame(src, dst) {
    let dIndex = 0;
    writeU32(dst, dIndex, magicNum);
    dIndex += 4;
    dst[dIndex++] = fdVersion;
    dst[dIndex++] = bsDefault << bsShift;
    dst[dIndex] = hash2(0, dst, 4, dIndex - 4) >> 8;
    dIndex++;
    const maxBlockSize = bsMap[bsDefault];
    let remaining = src.length;
    let sIndex = 0;
    clearHashTable(hashTable);
    while (remaining > 0) {
      let compSize = 0;
      const blockSize = remaining > maxBlockSize ? maxBlockSize : remaining;
      compSize = compressBlock(src, blockBuf, sIndex, blockSize, hashTable);
      if (compSize > blockSize || compSize === 0) {
        writeU32(dst, dIndex, 2147483648 | blockSize);
        dIndex += 4;
        for (let z = sIndex + blockSize; sIndex < z; ) {
          dst[dIndex++] = src[sIndex++];
        }
        remaining -= blockSize;
      } else {
        writeU32(dst, dIndex, compSize);
        dIndex += 4;
        for (let j = 0; j < compSize; ) {
          dst[dIndex++] = blockBuf[j++];
        }
        sIndex += blockSize;
        remaining -= blockSize;
      }
    }
    writeU32(dst, dIndex, 0);
    dIndex += 4;
    return dIndex;
  }
  function decompress(src, maxSize) {
    let dst, size;
    if (maxSize === void 0) {
      maxSize = decompressBound(src);
    }
    dst = makeBuffer(maxSize);
    size = decompressFrame(src, dst);
    if (size !== maxSize) {
      dst = sliceArray(dst, 0, size);
    }
    return dst;
  }
  function compress2(src, maxSize) {
    let dst, size;
    if (maxSize === void 0) {
      maxSize = compressBound(src.length);
    }
    dst = makeBuffer(maxSize);
    size = compressFrame(src, dst);
    if (size !== maxSize) {
      dst = sliceArray(dst, 0, size);
    }
    return dst;
  }
  var RangeList = class {
    constructor() {
      __publicField(this, "ranges", []);
    }
    /**
     * Add a range to the list. If it overlaps with existing ranges,
     * it will split them and increment reference counts accordingly.
     */
    add(start, end) {
      if (end <= start) {
        throw new TypeError("End must be greater than start");
      }
      const overlappingRanges = [];
      for (let i = 0; i < this.ranges.length; i++) {
        const range2 = this.ranges[i];
        if (start < range2.end && end > range2.start) {
          overlappingRanges.push({ index: i, range: range2 });
        }
        if (range2.data !== null) {
          throw new Error("Overlapping range already has data");
        }
      }
      if (overlappingRanges.length === 0) {
        this.ranges.push({ start, end, refCount: 1, data: null });
        this.ranges.sort((a, b) => a.start - b.start);
        return;
      }
      const newRanges = [];
      let currentPos = start;
      for (let i = 0; i < overlappingRanges.length; i++) {
        const { range: range2 } = overlappingRanges[i];
        if (currentPos < range2.start) {
          newRanges.push({
            start: currentPos,
            end: range2.start,
            refCount: 1,
            data: null
          });
        } else if (range2.start < currentPos) {
          newRanges.push({
            start: range2.start,
            end: currentPos,
            refCount: range2.refCount,
            data: null
          });
        }
        newRanges.push({
          start: Math.max(currentPos, range2.start),
          end: Math.min(end, range2.end),
          refCount: range2.refCount + 1,
          data: null
        });
        if (range2.end > end) {
          newRanges.push({
            start: end,
            end: range2.end,
            refCount: range2.refCount,
            data: null
          });
        }
        currentPos = Math.max(currentPos, range2.end);
      }
      if (currentPos < end) {
        newRanges.push({
          start: currentPos,
          end,
          refCount: 1,
          data: null
        });
      }
      const firstIndex = overlappingRanges[0].index;
      const lastIndex = overlappingRanges[overlappingRanges.length - 1].index;
      this.ranges.splice(firstIndex, lastIndex - firstIndex + 1, ...newRanges);
      this.ranges.sort((a, b) => a.start - b.start);
    }
    /**
     * Remove a range from the list. The range must start and end at existing boundaries.
     */
    remove(start, end) {
      if (end <= start) {
        throw new TypeError("End must be greater than start");
      }
      const affectedRanges = [];
      for (let i = 0; i < this.ranges.length; i++) {
        const range2 = this.ranges[i];
        if (start < range2.end && end > range2.start) {
          affectedRanges.push({ index: i, range: range2 });
        }
      }
      if (affectedRanges.length === 0) {
        throw new Error("No ranges found to remove");
      }
      if (start !== affectedRanges[0].range.start || end !== affectedRanges[affectedRanges.length - 1].range.end) {
        throw new Error("Range boundaries must match existing boundaries");
      }
      for (let i = 0; i < affectedRanges.length; i++) {
        const { range: range2 } = affectedRanges[i];
        range2.refCount--;
      }
      this.ranges = this.ranges.filter((range2) => range2.refCount > 0);
    }
    /**
     * Get all ranges within the specified boundaries.
     */
    getRanges(start, end) {
      if (end <= start) {
        throw new TypeError("End must be greater than start");
      }
      return this.ranges.filter((range2) => start < range2.end && end > range2.start);
    }
    /**
     * Get all ranges in the list
     */
    getAllRanges() {
      return [...this.ranges];
    }
  };
  function indexOfSubsequence(haystack, needle, from = 0) {
    const needleLength = needle.length;
    if (needleLength === 0) {
      return from <= haystack.length ? from : -1;
    }
    const last = needleLength - 1;
    const maxStart = haystack.length - needleLength;
    const skip = new Uint16Array(256).fill(needleLength);
    for (let i2 = 0; i2 < last; i2++) {
      skip[needle[i2]] = last - i2;
    }
    let i = from;
    while (i <= maxStart) {
      let j = last;
      while (j >= 0 && haystack[i + j] === needle[j]) {
        j--;
      }
      if (j < 0) {
        return i;
      }
      i += skip[haystack[i + last]];
    }
    return -1;
  }
  var textEncoder = new TextEncoder();
  var CRLF = textEncoder.encode("\r\n");
  var HEADER_SEPARATOR = textEncoder.encode("\r\n\r\n");
  var STAGING_BLOCK_SIZE = 65536;
  var _delimiter, _carry, _partChunks, _partLength, _staging, _stagingLength, _state, _done, _StreamingMultipartParser_instances, appendToPart_fn, flushStaging_fn, takePart_fn, _a;
  var StreamingMultipartParser = (_a = class {
    constructor(contentType) {
      __privateAdd(this, _StreamingMultipartParser_instances);
      __privateAdd(this, _delimiter);
      /**
       * Unprocessed bytes carried between pushes: bounded by the delimiter length in states 0/2
       * (a possible partial delimiter), tiny in state 1. Seeded with a virtual CRLF so a body
       * starting directly with `--boundary` (RFC 2046: the first delimiter's leading CRLF is
       * "considered part of the preamble") still matches the `\r\n--boundary` delimiter.
       */
      __privateAdd(this, _carry, CRLF);
      /** Confirmed bytes (headers + data) of the in-progress part, as ≥STAGING_BLOCK_SIZE chunks. */
      __privateAdd(this, _partChunks, []);
      __privateAdd(this, _partLength, 0);
      /** Staging block coalescing small appends; pushed to #partChunks when full. */
      __privateAdd(this, _staging);
      __privateAdd(this, _stagingLength, 0);
      /** 0 = scanning for first boundary, 1 = consuming CRLF/`--` after a boundary, 2 = inside a part */
      __privateAdd(this, _state, 0);
      __privateAdd(this, _done, false);
      const boundary = extractBoundary(contentType);
      if (!boundary) {
        throw new Error(`No boundary found in Content-Type: ${contentType}`);
      }
      __privateSet(this, _delimiter, textEncoder.encode(`\r
--${boundary}`));
    }
    /**
     * Push a chunk of body bytes (call with no argument to flush at end of stream).
     * Returns the raw bytes of any parts that completed as a result.
     *
     * Copying is linear: each byte is combined with the (bounded) carry once, staged once, and
     * copied into the completed part once.
     */
    push(chunk2) {
      if (__privateGet(this, _done)) {
        return [];
      }
      let data = chunk2 && chunk2.byteLength ? combineUint8Arrays(__privateGet(this, _carry), chunk2) : __privateGet(this, _carry);
      __privateSet(this, _carry, new Uint8Array(0));
      const parts = [];
      for (; ; ) {
        if (__privateGet(this, _state) === 0 || __privateGet(this, _state) === 2) {
          const delimIndex = indexOfSubsequence(data, __privateGet(this, _delimiter), 0);
          if (delimIndex === -1) {
            const safeLength = Math.max(0, data.byteLength - (__privateGet(this, _delimiter).byteLength - 1));
            if (__privateGet(this, _state) === 2 && safeLength > 0) {
              __privateMethod(this, _StreamingMultipartParser_instances, appendToPart_fn).call(this, data.subarray(0, safeLength));
            }
            __privateSet(this, _carry, data.slice(safeLength));
            break;
          }
          if (__privateGet(this, _state) === 2) {
            __privateMethod(this, _StreamingMultipartParser_instances, appendToPart_fn).call(this, data.subarray(0, delimIndex));
            const partBody = __privateMethod(this, _StreamingMultipartParser_instances, takePart_fn).call(this);
            const headerEnd = indexOfSubsequence(partBody, HEADER_SEPARATOR, 0);
            if (headerEnd === -1) {
              throw new Error("Malformed multipart part: missing header/data separator");
            }
            parts.push(partBody.subarray(headerEnd + HEADER_SEPARATOR.byteLength));
          }
          data = data.slice(delimIndex + __privateGet(this, _delimiter).byteLength);
          __privateSet(this, _state, 1);
          continue;
        }
        if (data.byteLength < 2) {
          __privateSet(this, _carry, data);
          break;
        }
        if (data[0] === 45 && data[1] === 45) {
          __privateSet(this, _done, true);
          return parts;
        }
        if (data[0] === CRLF[0] && data[1] === CRLF[1]) {
          data = data.slice(2);
          __privateSet(this, _state, 2);
          continue;
        }
        throw new Error("Malformed multipart body: expected CRLF or closing delimiter after boundary");
      }
      return parts;
    }
  }, _delimiter = new WeakMap(), _carry = new WeakMap(), _partChunks = new WeakMap(), _partLength = new WeakMap(), _staging = new WeakMap(), _stagingLength = new WeakMap(), _state = new WeakMap(), _done = new WeakMap(), _StreamingMultipartParser_instances = new WeakSet(), /** Append confirmed part bytes, coalescing small appends into staging blocks. */
  appendToPart_fn = function(bytes) {
    __privateSet(this, _partLength, __privateGet(this, _partLength) + bytes.byteLength);
    if (bytes.byteLength >= STAGING_BLOCK_SIZE) {
      __privateMethod(this, _StreamingMultipartParser_instances, flushStaging_fn).call(this);
      __privateGet(this, _partChunks).push(bytes);
      return;
    }
    let offset = 0;
    while (offset < bytes.byteLength) {
      if (!__privateGet(this, _staging)) {
        __privateSet(this, _staging, new Uint8Array(STAGING_BLOCK_SIZE));
        __privateSet(this, _stagingLength, 0);
      }
      const toCopy = Math.min(STAGING_BLOCK_SIZE - __privateGet(this, _stagingLength), bytes.byteLength - offset);
      __privateGet(this, _staging).set(bytes.subarray(offset, offset + toCopy), __privateGet(this, _stagingLength));
      __privateSet(this, _stagingLength, __privateGet(this, _stagingLength) + toCopy);
      offset += toCopy;
      if (__privateGet(this, _stagingLength) === STAGING_BLOCK_SIZE) {
        __privateGet(this, _partChunks).push(__privateGet(this, _staging));
        __privateSet(this, _staging, void 0);
      }
    }
  }, flushStaging_fn = function() {
    if (__privateGet(this, _staging) && __privateGet(this, _stagingLength) > 0) {
      __privateGet(this, _partChunks).push(__privateGet(this, _staging).subarray(0, __privateGet(this, _stagingLength)));
    }
    __privateSet(this, _staging, void 0);
    __privateSet(this, _stagingLength, 0);
  }, /** Assemble and reset the in-progress part. Loop-based copy: the chunk count is unbounded-safe. */
  takePart_fn = function() {
    __privateMethod(this, _StreamingMultipartParser_instances, flushStaging_fn).call(this);
    const out = new Uint8Array(__privateGet(this, _partLength));
    let offset = 0;
    for (const chunk2 of __privateGet(this, _partChunks)) {
      out.set(chunk2, offset);
      offset += chunk2.byteLength;
    }
    __privateSet(this, _partChunks, []);
    __privateSet(this, _partLength, 0);
    return out;
  }, _a);
  function extractBoundary(contentType) {
    for (const part of contentType.split(";")) {
      const trimmed = part.trim();
      if (trimmed.toLowerCase().startsWith("boundary=")) {
        return trimmed.slice("boundary=".length).replace(/^"|"$/g, "");
      }
    }
    return null;
  }
  function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  }
  function concatUint8Arrays(arrays) {
    const result = new Uint8Array(sum(arrays.map((array) => array.byteLength)));
    let offset = 0;
    for (const array of arrays) {
      result.set(array, offset);
      offset += array.byteLength;
    }
    return result;
  }
  function hasH2Fetch(versions = typeof process !== "undefined" ? process.versions : void 0, frontend = isFrontend) {
    if (frontend || !versions?.undici || versions.bun) {
      return false;
    }
    return Number(versions.undici.split(".")[0]) >= 8;
  }
  var GLOBAL_DISPATCHER_KEYS = [Symbol.for("undici.globalDispatcher.2"), Symbol.for("undici.globalDispatcher.1")];
  function withHttp1(base) {
    return {
      dispatch: (options, handler) => base.dispatch({ ...options, allowH2: false }, handler)
    };
  }
  var cached;
  async function getHttp1Dispatcher() {
    const globals = globalThis;
    const find = () => GLOBAL_DISPATCHER_KEYS.map((key) => globals[key]).find((d) => typeof d?.dispatch === "function");
    let base = find();
    if (base === void 0) {
      await (await fetch("data:,")).arrayBuffer();
      base = find();
    }
    if (base === void 0) {
      return void 0;
    }
    if (cached?.base !== base) {
      cached = { base, http1: withHttp1(base) };
    }
    return cached.http1;
  }
  var undiciHttp1Fetch = async (input, init) => {
    const dispatcher = await getHttp1Dispatcher();
    return dispatcher ? fetch(input, { ...init, dispatcher }) : fetch(input, init);
  };
  var http1Fetch = hasH2Fetch() ? undiciHttp1Fetch : (input, init) => fetch(input, init);
  var JWT_SAFETY_PERIOD = 6e4;
  var JWT_CACHE_SIZE = 1e3;
  var PARALLEL_DEFAULT_MAX_CONCURRENCY = isFrontend ? 4 : 8;
  var PARALLEL_MIN_IN_FLIGHT_BYTES = 64 * 1024 * 1024;
  var PARALLEL_MAX_IN_FLIGHT_BYTES = 256 * 1024 * 1024;
  var PARALLEL_CONTROLLER_TICK_MS = 500;
  var PARALLEL_PROBE_KEEP_MARGIN = 1.05;
  var PARALLEL_PLATEAU_HOLD_TICKS = 10;
  var _resolvers, _a2;
  var Notifier = (_a2 = class {
    constructor() {
      __privateAdd(this, _resolvers, []);
    }
    wait() {
      return new Promise((resolve2) => __privateGet(this, _resolvers).push(resolve2));
    }
    notifyAll() {
      const resolvers = __privateGet(this, _resolvers);
      __privateSet(this, _resolvers, []);
      for (const resolve2 of resolvers) {
        resolve2();
      }
    }
  }, _resolvers = new WeakMap(), _a2);
  function delay(ms) {
    return new Promise((resolve2) => setTimeout(resolve2, ms));
  }
  var compressionSchemeLabels = {
    [
      0
      /* None */
    ]: "None",
    [
      1
      /* LZ4 */
    ]: "LZ4",
    [
      2
      /* ByteGroupingLZ4 */
    ]: "ByteGroupingLZ4"
  };
  var XET_CHUNK_HEADER_BYTES = 8;
  function parseChunkHeader(view) {
    const chunkHeader = {
      version: view.getUint8(0),
      compressed_length: view.getUint8(1) | view.getUint8(2) << 8 | view.getUint8(3) << 16,
      compression_scheme: view.getUint8(4),
      uncompressed_length: view.getUint8(5) | view.getUint8(6) << 8 | view.getUint8(7) << 16
    };
    if (chunkHeader.version !== 0) {
      throw new Error(`Unsupported chunk version ${chunkHeader.version}`);
    }
    if (chunkHeader.compression_scheme !== 0 && chunkHeader.compression_scheme !== 1 && chunkHeader.compression_scheme !== 2) {
      throw new Error(
        `Unsupported compression scheme ${compressionSchemeLabels[chunkHeader.compression_scheme] ?? chunkHeader.compression_scheme}`
      );
    }
    return chunkHeader;
  }
  function decompressChunk(chunkHeader, compressed) {
    switch (chunkHeader.compression_scheme) {
      case 1:
        return decompress(compressed, chunkHeader.uncompressed_length);
      case 2:
        return bg4_regroup_bytes(decompress(compressed, chunkHeader.uncompressed_length));
      default:
        return compressed.slice();
    }
  }
  function decodePartChunks(data, descriptor, rangeList) {
    const ranges = rangeList.getRanges(descriptor.chunks.start, descriptor.chunks.end);
    const staged = /* @__PURE__ */ new Map();
    let chunkIndex = descriptor.chunks.start;
    let offset = 0;
    while (offset < data.byteLength) {
      if (chunkIndex >= descriptor.chunks.end) {
        throw new Error(
          `Multipart part for chunks ${descriptor.chunks.start}-${descriptor.chunks.end} contains more chunks than expected`
        );
      }
      if (data.byteLength - offset < XET_CHUNK_HEADER_BYTES) {
        throw new Error("Truncated chunk header in multipart part");
      }
      const chunkHeader = parseChunkHeader(new DataView(data.buffer, data.byteOffset + offset, XET_CHUNK_HEADER_BYTES));
      const compressedStart = offset + XET_CHUNK_HEADER_BYTES;
      const compressedEnd = compressedStart + chunkHeader.compressed_length;
      if (compressedEnd > data.byteLength) {
        throw new Error("Truncated chunk data in multipart part");
      }
      const uncompressed = decompressChunk(chunkHeader, data.subarray(compressedStart, compressedEnd));
      const range2 = ranges.find((range3) => chunkIndex >= range3.start && chunkIndex < range3.end);
      if (range2) {
        let chunks = staged.get(range2);
        if (!chunks) {
          chunks = [];
          staged.set(range2, chunks);
        }
        chunks.push(uncompressed);
      }
      chunkIndex++;
      offset = compressedEnd;
    }
    if (chunkIndex !== descriptor.chunks.end) {
      throw new Error(
        `Multipart part decoded chunks ${descriptor.chunks.start}-${chunkIndex} but expected ${descriptor.chunks.start}-${descriptor.chunks.end}`
      );
    }
    return staged;
  }
  function commitChunks(staged) {
    let committed = 0;
    for (const [range2, chunks] of staged) {
      if (range2.data) {
        continue;
      }
      range2.data = chunks;
      committed += sum(chunks.map((chunk2) => chunk2.byteLength));
    }
    return committed;
  }
  var _XetBlob_instances, clone_fn, _reconstructionInfoPromise, loadReconstructionInfo_fn, fetch_fn, _a3;
  var XetBlob = (_a3 = class extends Blob {
    constructor(params) {
      super([]);
      __privateAdd(this, _XetBlob_instances);
      __publicField(this, "fetch");
      __publicField(this, "accessToken");
      __publicField(this, "refreshUrl");
      __publicField(this, "reconstructionUrl");
      __publicField(this, "hash");
      __publicField(this, "start", 0);
      __publicField(this, "end", 0);
      __publicField(this, "internalLogging", false);
      __publicField(this, "reconstructionInfo");
      __publicField(this, "listener");
      __publicField(this, "parallelDownloads");
      __privateAdd(this, _reconstructionInfoPromise);
      this.fetch = params.fetch ?? http1Fetch;
      this.accessToken = checkCredentials(params);
      this.refreshUrl = params.refreshUrl;
      this.end = params.size;
      this.reconstructionUrl = params.reconstructionUrl;
      this.hash = params.hash;
      this.listener = params.listener;
      this.internalLogging = params.internalLogging ?? false;
      this.parallelDownloads = params.parallelDownloads;
      if (params.readToken) {
        const key = cacheKey({ refreshUrl: this.refreshUrl, initialAccessToken: this.accessToken });
        jwts.set(key, {
          accessToken: params.readToken.accessToken,
          expiresAt: new Date(params.readToken.exp * 1e3),
          casUrl: params.readToken.casUrl
        });
      }
    }
    get size() {
      return this.end - this.start;
    }
    slice(start = 0, end = this.size) {
      if (start < 0 || end < 0) {
        throw new TypeError("Unsupported negative start/end on XetBlob.slice");
      }
      const slice = __privateMethod(this, _XetBlob_instances, clone_fn).call(this);
      slice.start = this.start + start;
      slice.end = Math.min(this.start + end, this.end);
      if (slice.start !== this.start || slice.end !== this.end) {
        slice.reconstructionInfo = void 0;
      }
      return slice;
    }
    async arrayBuffer() {
      const reader = (await __privateMethod(this, _XetBlob_instances, fetch_fn).call(this)).getReader();
      const chunks = [];
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        chunks.push(value);
      }
      return concatUint8Arrays(chunks).buffer;
    }
    async text() {
      return new TextDecoder().decode(await this.arrayBuffer());
    }
    async response() {
      const result = await __privateMethod(this, _XetBlob_instances, fetch_fn).call(this);
      return new Response(result);
    }
    stream() {
      const stream = new TransformStream();
      __privateMethod(this, _XetBlob_instances, fetch_fn).call(this).then((response) => response.pipeThrough(stream)).catch((error) => stream.writable.abort(error.message));
      return stream.readable;
    }
  }, _XetBlob_instances = new WeakSet(), clone_fn = function() {
    const blob = new XetBlob({
      fetch: this.fetch,
      hash: this.hash,
      refreshUrl: this.refreshUrl,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      reconstructionUrl: this.reconstructionUrl,
      size: this.size
    });
    blob.accessToken = this.accessToken;
    blob.start = this.start;
    blob.end = this.end;
    blob.reconstructionInfo = this.reconstructionInfo;
    blob.listener = this.listener;
    blob.internalLogging = this.internalLogging;
    blob.parallelDownloads = this.parallelDownloads;
    return blob;
  }, _reconstructionInfoPromise = new WeakMap(), loadReconstructionInfo_fn = function() {
    if (__privateGet(this, _reconstructionInfoPromise)) {
      return __privateGet(this, _reconstructionInfoPromise);
    }
    __privateSet(this, _reconstructionInfoPromise, (async () => {
      const connParams = await getAccessToken(this.accessToken, this.fetch, this.refreshUrl);
      const url = this.reconstructionUrl ? this.reconstructionUrl.replace("/v1/reconstructions/", "/v2/reconstructions/") : `${connParams.casUrl}/v2/reconstructions/${this.hash}`;
      const resp = await this.fetch(url, {
        headers: {
          Authorization: `Bearer ${connParams.accessToken}`,
          Range: `bytes=${this.start}-${this.end - 1}`
        }
      });
      if (!resp.ok) {
        throw await createApiError(resp);
      }
      this.reconstructionInfo = await resp.json();
      return this.reconstructionInfo;
    })().finally(() => __privateSet(this, _reconstructionInfoPromise, void 0)));
    return __privateGet(this, _reconstructionInfoPromise);
  }, fetch_fn = async function() {
    if (this.size === 0) {
      return new ReadableStream({
        start(controller) {
          controller.close();
        }
      });
    }
    if (!this.reconstructionInfo) {
      await __privateMethod(this, _XetBlob_instances, loadReconstructionInfo_fn).call(this);
    }
    const rangeLists = /* @__PURE__ */ new Map();
    if (!this.reconstructionInfo) {
      throw new Error("Failed to load reconstruction info");
    }
    for (const term of this.reconstructionInfo.terms) {
      let rangeList = rangeLists.get(term.hash);
      if (!rangeList) {
        rangeList = new RangeList();
        rangeLists.set(term.hash, rangeList);
      }
      rangeList.add(term.range.start, term.range.end);
    }
    const listener = this.listener;
    const log = this.internalLogging ? (...args) => console.log(...args) : () => {
    };
    async function* readData(reconstructionInfo, customFetch, maxBytes, reloadReconstructionInfo) {
      let totalBytesRead = 0;
      let readBytesToSkip = reconstructionInfo.offset_into_first_range;
      for (const term of reconstructionInfo.terms) {
        if (totalBytesRead >= maxBytes) {
          break;
        }
        const rangeList = rangeLists.get(term.hash);
        if (!rangeList) {
          throw new Error(`Failed to find range list for term ${term.hash}`);
        }
        const locate = (info) => {
          for (const entry of info.xorbs[term.hash] ?? []) {
            const descriptor2 = entry.ranges.find(
              (r) => r.chunks.start <= term.range.start && r.chunks.end >= term.range.end
            );
            if (descriptor2) {
              return { entry, descriptor: descriptor2 };
            }
          }
          return void 0;
        };
        const buildMultiRangeHeader = (entry) => `bytes=${entry.ranges.map((r) => `${r.bytes.start}-${r.bytes.end}`).join(",")}`;
        const fetchMultiRangeEntry = async (entry) => {
          let resp2 = await customFetch(entry.url, { headers: { Range: buildMultiRangeHeader(entry) } });
          if (resp2.status === 403) {
            reconstructionInfo = await reloadReconstructionInfo();
            const relocated = locate(reconstructionInfo);
            if (!relocated) {
              throw new Error(
                `Failed to find fetch info for term ${term.hash} and range ${term.range.start}-${term.range.end} after refresh`
              );
            }
            entry = relocated.entry;
            resp2 = await customFetch(entry.url, { headers: { Range: buildMultiRangeHeader(entry) } });
          }
          if (!resp2.ok) {
            throw await createApiError(resp2);
          }
          const contentType = resp2.headers.get("content-type") ?? "";
          if (!contentType.includes("multipart/byteranges")) {
            throw new Error(`Expected multipart/byteranges response for multi-range request, got "${contentType}"`);
          }
          const reader2 = resp2.body?.getReader();
          if (!reader2) {
            throw new Error("Failed to get reader from response body");
          }
          const parser = new StreamingMultipartParser(contentType);
          const stagedParts = [];
          let partIndex = 0;
          const consumeParts = (parts) => {
            for (const part of parts) {
              const descriptor2 = entry.ranges[partIndex];
              if (!descriptor2) {
                throw new Error(`Received more multipart parts than the ${entry.ranges.length} signed ranges`);
              }
              stagedParts.push(decodePartChunks(part, descriptor2, rangeList));
              partIndex++;
            }
          };
          try {
            for (; ; ) {
              const result = await reader2.read();
              listener?.({ event: "read" });
              if (result.done) {
                break;
              }
              if (result.value) {
                consumeParts(parser.push(result.value));
              }
            }
            consumeParts(parser.push());
          } finally {
            await reader2.cancel().catch(() => {
            });
          }
          if (partIndex !== entry.ranges.length) {
            throw new Error(
              `Multi-range fetch produced ${partIndex} parts but expected ${entry.ranges.length} for term ${term.hash}`
            );
          }
          for (const staged of stagedParts) {
            commitChunks(staged);
          }
        };
        let termRanges = rangeList.getRanges(term.range.start, term.range.end);
        if (!termRanges.every((range2) => range2.data)) {
          const located2 = locate(reconstructionInfo);
          if (!located2) {
            throw new Error(
              `Failed to find fetch info for term ${term.hash} and range ${term.range.start}-${term.range.end}`
            );
          }
          if (located2.entry.ranges.length > 1) {
            await fetchMultiRangeEntry(located2.entry);
            termRanges = rangeList.getRanges(term.range.start, term.range.end);
          }
        }
        {
          if (termRanges.every((range2) => range2.data)) {
            log("all data available for term", term.hash, readBytesToSkip);
            const cachedLength = sum(termRanges.map((range2) => sum(range2.data.map((chunk2) => chunk2.byteLength))));
            if (cachedLength !== term.unpacked_length) {
              throw new Error(
                `Term ${term.hash} range ${term.range.start}-${term.range.end} decoded to ${cachedLength} bytes, expected ${term.unpacked_length}`
              );
            }
            rangeLoop:
              for (const range2 of termRanges) {
                for (let chunk2 of range2.data) {
                  if (readBytesToSkip) {
                    const skipped = Math.min(readBytesToSkip, chunk2.byteLength);
                    chunk2 = chunk2.slice(skipped);
                    readBytesToSkip -= skipped;
                    if (!chunk2.byteLength) {
                      continue;
                    }
                  }
                  if (chunk2.byteLength > maxBytes - totalBytesRead) {
                    chunk2 = chunk2.slice(0, maxBytes - totalBytesRead);
                  }
                  totalBytesRead += chunk2.byteLength;
                  yield range2.refCount > 1 ? chunk2.slice() : chunk2;
                  listener?.({ event: "progress", progress: { read: totalBytesRead, total: maxBytes } });
                  if (totalBytesRead >= maxBytes) {
                    break rangeLoop;
                  }
                }
              }
            rangeList.remove(term.range.start, term.range.end);
            continue;
          }
        }
        let located = locate(reconstructionInfo);
        if (!located) {
          throw new Error(
            `Failed to find fetch info for term ${term.hash} and range ${term.range.start}-${term.range.end}`
          );
        }
        let descriptor = located.descriptor;
        log("term", term);
        log("descriptor", descriptor);
        log("readBytesToSkip", readBytesToSkip);
        let resp = await customFetch(located.entry.url, {
          headers: {
            Range: `bytes=${descriptor.bytes.start}-${descriptor.bytes.end}`
          }
        });
        if (resp.status === 403) {
          reconstructionInfo = await reloadReconstructionInfo();
          located = locate(reconstructionInfo);
          if (!located) {
            throw new Error(
              `Failed to find fetch info for term ${term.hash} and range ${term.range.start}-${term.range.end} after refresh`
            );
          }
          descriptor = located.descriptor;
          resp = await customFetch(located.entry.url, {
            headers: {
              Range: `bytes=${descriptor.bytes.start}-${descriptor.bytes.end}`
            }
          });
        }
        if (!resp.ok) {
          throw await createApiError(resp);
        }
        log(
          "expected content length",
          resp.headers.get("content-length"),
          "range",
          descriptor.bytes,
          resp.headers.get("content-range")
        );
        const reader = resp.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get reader from response body");
        }
        let done = false;
        let chunkIndex = descriptor.chunks.start;
        const ranges = rangeList.getRanges(descriptor.chunks.start, descriptor.chunks.end);
        let leftoverBytes = void 0;
        let totalFetchBytes = 0;
        fetchData:
          while (!done && totalBytesRead < maxBytes) {
            const result = await reader.read();
            listener?.({ event: "read" });
            done = result.done;
            log("read", result.value?.byteLength, "bytes", "total read", totalBytesRead, "toSkip", readBytesToSkip);
            if (!result.value) {
              log("no data in result, cancelled", result);
              continue;
            }
            totalFetchBytes += result.value.byteLength;
            if (leftoverBytes) {
              result.value = combineUint8Arrays(leftoverBytes, result.value);
              leftoverBytes = void 0;
            }
            while (totalBytesRead < maxBytes && result.value?.byteLength) {
              if (result.value.byteLength < 8) {
                leftoverBytes = result.value;
                continue fetchData;
              }
              const header = new DataView(result.value.buffer, result.value.byteOffset, XET_CHUNK_HEADER_BYTES);
              const chunkHeader = parseChunkHeader(header);
              log("chunk header", chunkHeader, "to skip", readBytesToSkip);
              if (result.value.byteLength < chunkHeader.compressed_length + XET_CHUNK_HEADER_BYTES) {
                leftoverBytes = result.value;
                continue fetchData;
              }
              result.value = result.value.slice(XET_CHUNK_HEADER_BYTES);
              let uncompressed = decompressChunk(chunkHeader, result.value.subarray(0, chunkHeader.compressed_length));
              const range2 = ranges.find((range3) => chunkIndex >= range3.start && chunkIndex < range3.end);
              const shouldYield = chunkIndex >= term.range.start && chunkIndex < term.range.end;
              const minRefCountToStore = shouldYield ? 2 : 1;
              let stored = false;
              if (range2 && range2.refCount >= minRefCountToStore) {
                range2.data ?? (range2.data = []);
                range2.data.push(uncompressed);
                stored = true;
              }
              if (shouldYield) {
                if (readBytesToSkip) {
                  const skipped = Math.min(readBytesToSkip, uncompressed.byteLength);
                  uncompressed = uncompressed.slice(readBytesToSkip);
                  readBytesToSkip -= skipped;
                }
                if (uncompressed.byteLength > maxBytes - totalBytesRead) {
                  uncompressed = uncompressed.slice(0, maxBytes - totalBytesRead);
                }
                if (uncompressed.byteLength) {
                  log(
                    "yield",
                    uncompressed.byteLength,
                    "bytes",
                    result.value.byteLength,
                    "total read",
                    totalBytesRead,
                    stored
                  );
                  totalBytesRead += uncompressed.byteLength;
                  yield stored ? uncompressed.slice() : uncompressed;
                  listener?.({ event: "progress", progress: { read: totalBytesRead, total: maxBytes } });
                }
              }
              chunkIndex++;
              result.value = result.value.slice(chunkHeader.compressed_length);
            }
          }
        if (done && totalBytesRead < maxBytes && totalFetchBytes < descriptor.bytes.end - descriptor.bytes.start + 1) {
          log("done", done, "total read", totalBytesRead, maxBytes, totalFetchBytes);
          log("failed to fetch all data for term", term.hash);
          throw new Error(
            `Failed to fetch all data for term ${term.hash}, fetched ${totalFetchBytes} bytes out of ${descriptor.bytes.end - descriptor.bytes.start + 1}`
          );
        }
        log("done", done, "total read", totalBytesRead, maxBytes, totalFetchBytes);
        log("cancel reader");
        await reader.cancel();
      }
    }
    const parallelOptions = this.parallelDownloads === false ? void 0 : this.parallelDownloads === true || this.parallelDownloads === void 0 ? {} : this.parallelDownloads;
    async function* readDataParallel(reconstructionInfo, customFetch, maxBytes, reloadReconstructionInfo, opts) {
      let totalBytesRead = 0;
      let readBytesToSkip = reconstructionInfo.offset_into_first_range;
      const terms = reconstructionInfo.terms;
      const locateEntryFor = (info, term) => {
        for (const entry of info.xorbs[term.hash] ?? []) {
          const descriptor = entry.ranges.find(
            (r) => r.chunks.start <= term.range.start && r.chunks.end >= term.range.end
          );
          if (descriptor) {
            return entry;
          }
        }
        return void 0;
      };
      const plan = [];
      const planIndexByUrl = /* @__PURE__ */ new Map();
      const termEntryIndex = [];
      for (const term of terms) {
        const entry = locateEntryFor(reconstructionInfo, term);
        if (!entry) {
          throw new Error(
            `Failed to find fetch info for term ${term.hash} and range ${term.range.start}-${term.range.end}`
          );
        }
        let idx = planIndexByUrl.get(entry.url);
        if (idx === void 0) {
          idx = plan.length;
          plan.push({ hash: term.hash, ranges: entry.ranges, url: entry.url });
          planIndexByUrl.set(entry.url, idx);
        }
        termEntryIndex.push(idx);
      }
      const maxConcurrency = Math.max(1, opts.maxConcurrency ?? PARALLEL_DEFAULT_MAX_CONCURRENCY);
      const estimateEntryBytes = (item) => sum(item.ranges.map((r) => r.bytes.end - r.bytes.start + 1));
      const largestEntryBytes = plan.length ? Math.max(...plan.map(estimateEntryBytes)) : 0;
      const maxInFlightBytes = opts.maxInFlightBytes ?? Math.min(PARALLEL_MAX_IN_FLIGHT_BYTES, Math.max(PARALLEL_MIN_IN_FLIGHT_BYTES, 3 * largestEntryBytes));
      const state = {
        nextEntry: 0,
        neededEntry: 0,
        target: 1,
        error: void 0,
        finished: false,
        inFlightBytes: 0,
        decodedBytes: 0,
        active: 0,
        claimed: 0,
        maxActive: 0,
        activeHighWater: 0,
        count429: 0,
        targetHistory: []
      };
      const notifier = new Notifier();
      const budgetAcquire = async (n, entryIdx) => {
        while (!state.error && !state.finished && state.inFlightBytes + n > maxInFlightBytes && entryIdx !== state.neededEntry) {
          await notifier.wait();
        }
        state.inFlightBytes += n;
      };
      const budgetRelease = (n) => {
        state.inFlightBytes -= n;
        notifier.notifyAll();
      };
      const refreshPlanUrls = (info) => {
        for (const item of plan) {
          const match = (info.xorbs[item.hash] ?? []).find(
            (e) => e.ranges.length === item.ranges.length && e.ranges.every(
              (r, i) => r.chunks.start === item.ranges[i].chunks.start && r.chunks.end === item.ranges[i].chunks.end
            )
          );
          if (match) {
            item.url = match.url;
            item.ranges = match.ranges;
          }
        }
      };
      const rangeHeaderFor = (item) => `bytes=${item.ranges.map((r) => `${r.bytes.start}-${r.bytes.end}`).join(",")}`;
      const decodeEntry = async (item, entryIdx, tally) => {
        if (state.error || state.finished) {
          return;
        }
        const rangeList = rangeLists.get(item.hash);
        if (!rangeList) {
          throw new Error(`Failed to find range list for entry ${item.hash}`);
        }
        let resp = await customFetch(item.url, { headers: { Range: rangeHeaderFor(item) } });
        let attempts403 = 0;
        let attempts429 = 0;
        while (resp.status === 403 && attempts403 < 1 || resp.status === 429 && attempts429 < 3) {
          await resp.body?.cancel().catch(() => {
          });
          if (resp.status === 403) {
            attempts403++;
            reconstructionInfo = await reloadReconstructionInfo();
            refreshPlanUrls(reconstructionInfo);
          } else {
            attempts429++;
            state.count429++;
            notifier.notifyAll();
            await delay(300 * attempts429);
          }
          resp = await customFetch(item.url, { headers: { Range: rangeHeaderFor(item) } });
        }
        if (!resp.ok) {
          throw await createApiError(resp);
        }
        const reader = resp.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get reader from response body");
        }
        try {
          if (item.ranges.length > 1) {
            const contentType = resp.headers.get("content-type") ?? "";
            if (!contentType.includes("multipart/byteranges")) {
              throw new Error(`Expected multipart/byteranges response for multi-range request, got "${contentType}"`);
            }
            const parser = new StreamingMultipartParser(contentType);
            let partIndex = 0;
            const handleParts = async (parts) => {
              for (const part of parts) {
                const descriptor = item.ranges[partIndex];
                if (!descriptor) {
                  throw new Error(`Received more multipart parts than the ${item.ranges.length} signed ranges`);
                }
                const staged = decodePartChunks(part, descriptor, rangeList);
                tally.committed += commitChunks(staged);
                state.decodedBytes += part.byteLength;
                partIndex++;
                notifier.notifyAll();
              }
            };
            for (; ; ) {
              if (state.error || state.finished) {
                return;
              }
              const result = await reader.read();
              listener?.({ event: "read" });
              if (result.done) {
                break;
              }
              if (result.value) {
                await handleParts(parser.push(result.value));
              }
            }
            await handleParts(parser.push());
            if (!state.finished && partIndex !== item.ranges.length) {
              throw new Error(
                `Multi-range fetch produced ${partIndex} parts but expected ${item.ranges.length} for ${item.hash}`
              );
            }
          } else {
            const descriptor = item.ranges[0];
            const ranges = rangeList.getRanges(descriptor.chunks.start, descriptor.chunks.end);
            const staged = /* @__PURE__ */ new Map();
            let chunkIndex = descriptor.chunks.start;
            let leftover;
            let done = false;
            while (!done) {
              if (state.error || state.finished) {
                return;
              }
              const result = await reader.read();
              listener?.({ event: "read" });
              done = result.done;
              let value = result.value;
              if (!value) {
                continue;
              }
              if (leftover) {
                value = combineUint8Arrays(leftover, value);
                leftover = void 0;
              }
              while (value.byteLength) {
                if (value.byteLength < XET_CHUNK_HEADER_BYTES) {
                  leftover = value;
                  break;
                }
                const chunkHeader = parseChunkHeader(
                  new DataView(value.buffer, value.byteOffset, XET_CHUNK_HEADER_BYTES)
                );
                if (value.byteLength < XET_CHUNK_HEADER_BYTES + chunkHeader.compressed_length) {
                  leftover = value;
                  break;
                }
                const uncompressed = decompressChunk(
                  chunkHeader,
                  value.subarray(XET_CHUNK_HEADER_BYTES, XET_CHUNK_HEADER_BYTES + chunkHeader.compressed_length)
                );
                const range2 = ranges.find((r) => chunkIndex >= r.start && chunkIndex < r.end);
                if (range2) {
                  let chunks = staged.get(range2);
                  if (!chunks) {
                    chunks = [];
                    staged.set(range2, chunks);
                  }
                  chunks.push(uncompressed);
                  if (chunkIndex === range2.end - 1 && !range2.data) {
                    range2.data = chunks;
                    tally.committed += sum(chunks.map((chunk2) => chunk2.byteLength));
                    notifier.notifyAll();
                  }
                }
                state.decodedBytes += uncompressed.byteLength;
                chunkIndex++;
                value = value.slice(XET_CHUNK_HEADER_BYTES + chunkHeader.compressed_length);
              }
            }
            if (!state.finished) {
              for (const range2 of ranges) {
                if (!range2.data) {
                  throw new Error(
                    `Failed to fetch all data for ${item.hash} chunks ${range2.start}-${range2.end} (stream ended early)`
                  );
                }
              }
            }
          }
        } finally {
          await reader.cancel().catch(() => {
          });
        }
      };
      const isTransientNetworkError = (error) => error instanceof TypeError || /terminated|socket|network|ECONNRESET|fetch failed/i.test(String(error));
      const runWorker = async (workerId) => {
        for (; ; ) {
          if (state.error || state.finished) {
            return;
          }
          if (workerId >= state.target) {
            await notifier.wait();
            continue;
          }
          const idx = state.nextEntry;
          if (idx >= plan.length) {
            return;
          }
          state.nextEntry++;
          state.claimed++;
          const est = estimateEntryBytes(plan[idx]);
          try {
            await budgetAcquire(est, idx);
            if (state.error || state.finished) {
              budgetRelease(est);
              return;
            }
            state.active++;
            state.maxActive = Math.max(state.maxActive, state.active);
            state.activeHighWater = Math.max(state.activeHighWater, state.active);
            let lastError;
            const tally = { committed: 0 };
            for (let attempt = 0; attempt < 2; attempt++) {
              try {
                await decodeEntry(plan[idx], idx, tally);
                budgetRelease(est - tally.committed);
                lastError = void 0;
                break;
              } catch (error) {
                lastError = error;
                if (attempt === 0 && !state.finished && isTransientNetworkError(error)) {
                  log("retrying entry after transient error", plan[idx].hash, error);
                  await delay(250);
                  continue;
                }
              }
            }
            if (lastError) {
              budgetRelease(est);
              state.error ?? (state.error = lastError);
            }
            state.active--;
          } finally {
            state.claimed--;
            notifier.notifyAll();
          }
        }
      };
      const workersDone = Promise.allSettled(Array.from({ length: maxConcurrency }, (_, i) => runWorker(i)));
      const levelRate = /* @__PURE__ */ new Map();
      let lastBytes = 0;
      let last429 = 0;
      let settleTicks = 1;
      let holdTicks = 0;
      const controller = setInterval(() => {
        const rate = state.decodedBytes - lastBytes;
        lastBytes = state.decodedBytes;
        const tickHighWater = state.activeHighWater;
        state.activeHighWater = state.active;
        holdTicks = Math.max(0, holdTicks - 1);
        if (state.count429 > last429) {
          last429 = state.count429;
          state.target = Math.max(1, state.target - 1);
          settleTicks = 1;
          holdTicks = PARALLEL_PLATEAU_HOLD_TICKS;
        } else if (rate === 0 && state.nextEntry < plan.length) {
          state.target = Math.min(maxConcurrency, state.target + 1);
          settleTicks = 1;
        } else if (settleTicks > 0) {
          settleTicks--;
        } else if (state.claimed >= state.target && tickHighWater <= state.target) {
          const ewma = ((levelRate.get(state.target) ?? rate) + rate) / 2;
          levelRate.set(state.target, ewma);
          const below = levelRate.get(state.target - 1);
          if (state.target > 1 && below === void 0) {
            state.target--;
            settleTicks = 1;
          } else if (below !== void 0 && ewma < below * PARALLEL_PROBE_KEEP_MARGIN) {
            levelRate.delete(state.target);
            state.target--;
            settleTicks = 1;
            holdTicks = PARALLEL_PLATEAU_HOLD_TICKS;
          } else if (holdTicks === 0 && state.target < maxConcurrency) {
            state.target++;
            settleTicks = 1;
          }
        }
        state.targetHistory.push(state.target);
        notifier.notifyAll();
      }, opts.controllerTickMs ?? PARALLEL_CONTROLLER_TICK_MS);
      try {
        for (let termIdx = 0; termIdx < terms.length; termIdx++) {
          const term = terms[termIdx];
          if (totalBytesRead >= maxBytes) {
            break;
          }
          state.neededEntry = termEntryIndex[termIdx];
          notifier.notifyAll();
          const rangeList = rangeLists.get(term.hash);
          if (!rangeList) {
            throw new Error(`Failed to find range list for term ${term.hash}`);
          }
          let termRanges = rangeList.getRanges(term.range.start, term.range.end);
          while (!termRanges.every((range2) => range2.data)) {
            if (state.error) {
              throw state.error;
            }
            if (state.claimed === 0 && state.nextEntry >= plan.length) {
              throw new Error(
                `Download workers finished without producing data for term ${term.hash} range ${term.range.start}-${term.range.end}`
              );
            }
            await notifier.wait();
            termRanges = rangeList.getRanges(term.range.start, term.range.end);
          }
          log("all data available for term", term.hash, readBytesToSkip);
          const cachedLength = sum(termRanges.map((range2) => sum(range2.data.map((chunk2) => chunk2.byteLength))));
          if (cachedLength !== term.unpacked_length) {
            throw new Error(
              `Term ${term.hash} range ${term.range.start}-${term.range.end} decoded to ${cachedLength} bytes, expected ${term.unpacked_length}`
            );
          }
          rangeLoop:
            for (const range2 of termRanges) {
              for (let chunk2 of range2.data) {
                if (readBytesToSkip) {
                  const skipped = Math.min(readBytesToSkip, chunk2.byteLength);
                  chunk2 = chunk2.slice(skipped);
                  readBytesToSkip -= skipped;
                  if (!chunk2.byteLength) {
                    continue;
                  }
                }
                if (chunk2.byteLength > maxBytes - totalBytesRead) {
                  chunk2 = chunk2.slice(0, maxBytes - totalBytesRead);
                }
                totalBytesRead += chunk2.byteLength;
                yield range2.refCount > 1 ? chunk2.slice() : chunk2;
                listener?.({ event: "progress", progress: { read: totalBytesRead, total: maxBytes } });
                if (totalBytesRead >= maxBytes) {
                  break rangeLoop;
                }
              }
            }
          let freed = 0;
          for (const range2 of termRanges) {
            if (range2.refCount === 1 && range2.data) {
              freed += sum(range2.data.map((chunk2) => chunk2.byteLength));
            }
          }
          rangeList.remove(term.range.start, term.range.end);
          budgetRelease(freed);
        }
      } finally {
        state.finished = true;
        clearInterval(controller);
        notifier.notifyAll();
        await workersDone;
        opts.onStat?.({
          entries: plan.length,
          maxActive: state.maxActive,
          finalTarget: state.target,
          count429: state.count429,
          targetHistory: state.targetHistory
        });
      }
    }
    const iterator = parallelOptions && (parallelOptions.maxConcurrency ?? PARALLEL_DEFAULT_MAX_CONCURRENCY) > 1 ? readDataParallel(
      this.reconstructionInfo,
      this.fetch,
      this.end - this.start,
      __privateMethod(this, _XetBlob_instances, loadReconstructionInfo_fn).bind(this),
      parallelOptions
    ) : readData(this.reconstructionInfo, this.fetch, this.end - this.start, __privateMethod(this, _XetBlob_instances, loadReconstructionInfo_fn).bind(this));
    return new ReadableStream(
      {
        // todo: when Safari supports it, type controller as ReadableByteStreamController
        async pull(controller) {
          const result = await iterator.next();
          if (result.value) {
            controller.enqueue(result.value);
          }
          if (result.done) {
            controller.close();
          }
        },
        async cancel() {
          await iterator.return?.(void 0);
        },
        type: "bytes"
        // todo: when Safari supports it, add autoAllocateChunkSize param
      },
      // todo : use ByteLengthQueuingStrategy when there's good support for it, currently in Node.js it fails due to size being a function
      {
        highWaterMark: 1e3
        // 1_000 chunks for ~1MB of RAM
      }
    );
  }, _a3);
  var jwtPromises = /* @__PURE__ */ new Map();
  var jwts = /* @__PURE__ */ new Map();
  function cacheKey(params) {
    return JSON.stringify([params.refreshUrl, params.initialAccessToken]);
  }
  function bg4_regroup_bytes(bytes) {
    const split = Math.floor(bytes.byteLength / 4);
    const rem = bytes.byteLength % 4;
    const g1_pos = split + (rem >= 1 ? 1 : 0);
    const g2_pos = g1_pos + split + (rem >= 2 ? 1 : 0);
    const g3_pos = g2_pos + split + (rem == 3 ? 1 : 0);
    const ret = new Uint8Array(bytes.byteLength);
    for (let i = 0, j = 0; i < bytes.byteLength; i += 4, j++) {
      ret[i] = bytes[j];
    }
    for (let i = 1, j = g1_pos; i < bytes.byteLength; i += 4, j++) {
      ret[i] = bytes[j];
    }
    for (let i = 2, j = g2_pos; i < bytes.byteLength; i += 4, j++) {
      ret[i] = bytes[j];
    }
    for (let i = 3, j = g3_pos; i < bytes.byteLength; i += 4, j++) {
      ret[i] = bytes[j];
    }
    return ret;
  }
  function bg4_split_bytes(bytes) {
    const ret = new Uint8Array(bytes.byteLength);
    const split = Math.floor(bytes.byteLength / 4);
    const rem = bytes.byteLength % 4;
    const g1_pos = split + (rem >= 1 ? 1 : 0);
    const g2_pos = g1_pos + split + (rem >= 2 ? 1 : 0);
    const g3_pos = g2_pos + split + (rem == 3 ? 1 : 0);
    for (let i = 0, j = 0; i < bytes.byteLength; i += 4, j++) {
      ret[j] = bytes[i];
    }
    for (let i = 1, j = g1_pos; i < bytes.byteLength; i += 4, j++) {
      ret[j] = bytes[i];
    }
    for (let i = 2, j = g2_pos; i < bytes.byteLength; i += 4, j++) {
      ret[j] = bytes[i];
    }
    for (let i = 3, j = g3_pos; i < bytes.byteLength; i += 4, j++) {
      ret[j] = bytes[i];
    }
    return ret;
  }
  async function getAccessToken(initialAccessToken, customFetch, refreshUrl) {
    const key = cacheKey({ refreshUrl, initialAccessToken });
    const jwt = jwts.get(key);
    if (jwt && jwt.expiresAt > new Date(Date.now() + JWT_SAFETY_PERIOD)) {
      return { accessToken: jwt.accessToken, casUrl: jwt.casUrl };
    }
    const existingPromise = jwtPromises.get(key);
    if (existingPromise) {
      return existingPromise;
    }
    const promise = (async () => {
      const resp = await customFetch(refreshUrl, {
        headers: {
          ...initialAccessToken ? {
            Authorization: `Bearer ${initialAccessToken}`
          } : {}
        }
      });
      if (!resp.ok) {
        throw new Error(`Failed to get JWT token: ${resp.status} ${await resp.text()}`);
      }
      const json = await resp.json();
      const jwt2 = {
        accessToken: json.accessToken,
        expiresAt: new Date(json.exp * 1e3),
        casUrl: json.casUrl
      };
      for (const [key2, value] of jwts.entries()) {
        if (value.expiresAt < new Date(Date.now() + JWT_SAFETY_PERIOD)) {
          jwts.delete(key2);
        } else {
          break;
        }
      }
      if (jwts.size >= JWT_CACHE_SIZE) {
        const keyToDelete = jwts.keys().next().value;
        if (keyToDelete) {
          jwts.delete(keyToDelete);
        }
      }
      jwts.set(key, jwt2);
      return {
        accessToken: json.accessToken,
        casUrl: json.casUrl
      };
    })().finally(() => {
      jwtPromises.delete(key);
    });
    jwtPromises.set(key, promise);
    return promise;
  }
  var CHUNK_CACHE_INITIAL_SIZE = 1e4;
  var CHUNK_CACHE_GROW_FACTOR = 1.5;
  var CHUNK_CACHE_MAX_SIZE = 1e6;
  var ChunkCache = class {
    constructor(maxSize = CHUNK_CACHE_MAX_SIZE) {
      __publicField(this, "index", 0);
      // Index >= 0 means local xorb, < 0 means remote xorb
      __publicField(this, "xorbIndices");
      // Max 8K chunks per xorb, less than 64K uint16_t
      __publicField(this, "chunkIndices");
      __publicField(this, "map", /* @__PURE__ */ new Map());
      // hash -> chunkCacheIndex. Less overhead that way, empty object is 60+B and empty array is 40+B
      __publicField(this, "hmacs", /* @__PURE__ */ new Set());
      // todo : remove old hmacs
      __publicField(this, "maxSize");
      if (maxSize < 1) {
        throw new Error("maxSize must be at least 1");
      }
      this.maxSize = maxSize;
      this.xorbIndices = new Int32Array(Math.min(CHUNK_CACHE_INITIAL_SIZE, maxSize));
      this.chunkIndices = new Uint16Array(Math.min(CHUNK_CACHE_INITIAL_SIZE, maxSize));
    }
    addChunkToCache(hash22, xorbIndex, chunkIndex, hmac3) {
      if (this.map.has(hash22)) {
        return;
      }
      if (this.map.values().next().value === this.index) {
        this.map.delete(this.map.keys().next().value);
      }
      this.map.set(hash22, this.index);
      if (hmac3 !== null) {
        this.hmacs.add(hmac3);
      }
      if (this.index >= this.xorbIndices.length) {
        const oldXorbIndices = this.xorbIndices;
        const oldChunkIndices = this.chunkIndices;
        this.xorbIndices = new Int32Array(Math.min(this.xorbIndices.length * CHUNK_CACHE_GROW_FACTOR, this.maxSize));
        this.chunkIndices = new Uint16Array(Math.min(this.chunkIndices.length * CHUNK_CACHE_GROW_FACTOR, this.maxSize));
        this.xorbIndices.set(oldXorbIndices);
        this.chunkIndices.set(oldChunkIndices);
      }
      this.xorbIndices[this.index] = xorbIndex;
      this.chunkIndices[this.index] = chunkIndex;
      this.index = (this.index + 1) % this.maxSize;
    }
    getChunk(hash22, hmacFunction) {
      let index = this.map.get(hash22);
      if (index === void 0 && hmacFunction !== null) {
        for (const hmac3 of this.hmacs) {
          index = this.map.get(hmacFunction(hash22, hmac3));
          if (index !== void 0) {
            break;
          }
        }
      }
      if (index === void 0) {
        return void 0;
      }
      return {
        xorbIndex: this.xorbIndices[index],
        chunkIndex: this.chunkIndices[index]
      };
    }
    updateChunkIndex(hash22, chunkIndex) {
      const index = this.map.get(hash22);
      if (index === void 0) {
        throw new Error(`Chunk not found in cache: ${hash22}`);
      }
      this.chunkIndices[index] = chunkIndex;
    }
    removeChunkFromCache(hash22) {
      this.map.delete(hash22);
    }
  };
  var JWT_SAFETY_PERIOD2 = 6e4;
  var JWT_CACHE_SIZE2 = 1e3;
  var jwtPromises2 = /* @__PURE__ */ new Map();
  var jwts2 = /* @__PURE__ */ new Map();
  async function xetWriteToken(params) {
    if (params.xetParams.expiresAt && params.xetParams.casUrl && params.xetParams.accessToken && params.xetParams.expiresAt > new Date(Date.now() + JWT_SAFETY_PERIOD2)) {
      return { accessToken: params.xetParams.accessToken, casUrl: params.xetParams.casUrl };
    }
    const key = params.xetParams.refreshWriteTokenUrl;
    const jwt = jwts2.get(key);
    if (jwt && jwt.expiresAt > new Date(Date.now() + JWT_SAFETY_PERIOD2)) {
      return { accessToken: jwt.accessToken, casUrl: jwt.casUrl };
    }
    const existingPromise = jwtPromises2.get(key);
    if (existingPromise) {
      return existingPromise;
    }
    const promise = (async () => {
      const resp = await (params.fetch ?? fetch)(params.xetParams.refreshWriteTokenUrl, {
        headers: {
          ...params.accessToken ? {
            Authorization: `Bearer ${params.accessToken}`
          } : {},
          ...params.xetParams.sessionId ? { "X-Xet-Session-Id": params.xetParams.sessionId } : {}
        }
      });
      if (!resp.ok) {
        throw await createApiError(resp);
      }
      const json = await resp.json();
      const jwt2 = {
        accessToken: json.accessToken,
        expiresAt: new Date(json.exp * 1e3),
        casUrl: json.casUrl
      };
      for (const [key2, value] of jwts2.entries()) {
        if (value.expiresAt < new Date(Date.now() + JWT_SAFETY_PERIOD2)) {
          jwts2.delete(key2);
        } else {
          break;
        }
      }
      if (jwts2.size >= JWT_CACHE_SIZE2) {
        const keyToDelete = jwts2.keys().next().value;
        if (keyToDelete) {
          jwts2.delete(keyToDelete);
        }
      }
      jwts2.set(key, jwt2);
      return {
        accessToken: json.accessToken,
        casUrl: json.casUrl
      };
    })().finally(() => {
      jwtPromises2.delete(key);
    });
    jwtPromises2.set(key, promise);
    return promise;
  }
  var HASH_LENGTH = 32;
  var XORB_HASH_BOOKEND = "ff".repeat(HASH_LENGTH);
  function readHashFromArray(array, offset) {
    let hash22 = "";
    for (let i = 0; i < HASH_LENGTH; i += 8) {
      hash22 += `${array[offset + i + 7].toString(16).padStart(2, "0")}${array[offset + i + 6].toString(16).padStart(2, "0")}${array[offset + i + 5].toString(16).padStart(2, "0")}${array[offset + i + 4].toString(16).padStart(2, "0")}${array[offset + i + 3].toString(16).padStart(2, "0")}${array[offset + i + 2].toString(16).padStart(2, "0")}${array[offset + i + 1].toString(16).padStart(2, "0")}${array[offset + i].toString(16).padStart(2, "0")}`;
    }
    return hash22;
  }
  async function parseShardData(shardBlob) {
    const shard = new Uint8Array(await shardBlob.arrayBuffer());
    const shardView = new DataView(shard.buffer);
    const magicTag = shard.slice(0, SHARD_MAGIC_TAG.length);
    if (!magicTag.every((byte, i) => byte === SHARD_MAGIC_TAG[i])) {
      throw new Error("Invalid shard magic tag");
    }
    const version = shardView.getBigUint64(SHARD_MAGIC_TAG.length, true);
    if (version !== SHARD_HEADER_VERSION) {
      throw new Error(`Invalid shard version: ${version}`);
    }
    const footerSize = Number(shardView.getBigUint64(SHARD_MAGIC_TAG.length + 8, true));
    const footerStart = shard.length - footerSize;
    const footerVersion = shardView.getBigUint64(footerStart, true);
    if (footerVersion !== SHARD_FOOTER_VERSION) {
      throw new Error(`Invalid shard footer version: ${footerVersion}`);
    }
    const xorbInfoStart = Number(shardView.getBigUint64(footerStart + 16, true));
    const fileLookupStart = Number(shardView.getBigUint64(footerStart + 24, true));
    const hmacKey = readHashFromArray(shard, footerStart + 72);
    const xorbs = [];
    let offset = xorbInfoStart;
    while (offset < fileLookupStart) {
      const xorbHash2 = readHashFromArray(shard, offset);
      offset += HASH_LENGTH;
      if (xorbHash2 === XORB_HASH_BOOKEND) {
        break;
      }
      offset += 4;
      const chunkCount = shardView.getUint32(offset, true);
      offset += 4;
      offset += 4;
      offset += 4;
      const chunks = [];
      for (let i = 0; i < chunkCount; i++) {
        const chunkHash = readHashFromArray(shard, offset);
        offset += HASH_LENGTH;
        const startOffset = shardView.getUint32(offset, true);
        offset += 4;
        const length = shardView.getUint32(offset, true);
        offset += 4;
        offset += 8;
        chunks.push({
          hash: chunkHash,
          startOffset,
          unpackedLength: length
        });
      }
      xorbs.push({
        hash: xorbHash2,
        chunks
      });
    }
    return {
      hmacKey,
      xorbs
    };
  }
  var SplicedBlob = class extends Blob {
    constructor(originalBlob, spliceOperations) {
      super();
      __publicField(this, "originalBlob");
      __publicField(this, "spliceOperations");
      this.originalBlob = originalBlob;
      this.spliceOperations = spliceOperations;
    }
    /**
     * Create a SplicedBlob from an original blob and a set of splice operations.
     *
     * Each operation replaces the original content in `[start, end)` with `insert`
     * (a pure insertion when `start === end`). Positions are byte offsets in the
     * original blob, are relative to the **original** content (not shifted by other
     * operations), and operations must not overlap (they can be passed in any order).
     *
     * As a convenience, a single `{ insert, start, end }` object is also accepted
     * instead of a one-element array.
     */
    static create(originalBlob, operations) {
      if (!Array.isArray(operations)) {
        operations = [operations];
      }
      for (const op of operations) {
        if (op.start < 0 || op.end < 0) {
          throw new Error("Invalid start/end positions for SplicedBlob");
        }
        if (op.start > originalBlob.size || op.end > originalBlob.size) {
          throw new Error("Invalid start/end positions for SplicedBlob");
        }
        if (op.start > op.end) {
          throw new Error("Invalid start/end positions for SplicedBlob");
        }
      }
      const sortedOps = [...operations].sort((a, b) => a.start - b.start);
      for (let i = 0; i < sortedOps.length - 1; i++) {
        if (sortedOps[i].end > sortedOps[i + 1].start) {
          throw new Error("Overlapping splice operations are not supported");
        }
      }
      return new SplicedBlob(originalBlob, sortedOps);
    }
    /**
     * Returns the size of the spliced blob.
     * Size = original size - total replaced size + total insert size
     */
    get size() {
      let totalReplacedSize = 0;
      let totalInsertSize = 0;
      for (const op of this.spliceOperations) {
        totalReplacedSize += op.end - op.start;
        totalInsertSize += op.insert.size;
      }
      return this.originalBlob.size - totalReplacedSize + totalInsertSize;
    }
    /**
     * Returns the MIME type of the original blob.
     */
    get type() {
      return this.originalBlob.type;
    }
    /**
     * Returns a new instance of SplicedBlob that is a slice of the current one.
     *
     * The slice is inclusive of the start and exclusive of the end.
     * The slice method does not support negative start/end.
     *
     * @param start beginning of the slice
     * @param end end of the slice
     */
    slice(start = 0, end = this.size) {
      if (start < 0 || end < 0) {
        throw new TypeError("Unsupported negative start/end on SplicedBlob.slice");
      }
      start = Math.min(start, this.size);
      end = Math.min(end, this.size);
      if (start >= end) {
        return new Blob([]);
      }
      const segments = this.segments;
      const segmentBoundaries = [0];
      let cumulativeSize = 0;
      for (const segment of segments) {
        cumulativeSize += segment.size;
        segmentBoundaries.push(cumulativeSize);
      }
      const resultSegments = [];
      for (let i = 0; i < segments.length; i++) {
        const segmentStart = segmentBoundaries[i];
        const segmentEnd = segmentBoundaries[i + 1];
        if (segmentEnd <= start) {
          continue;
        }
        if (segmentStart >= end) {
          break;
        }
        const sliceStart = Math.max(0, start - segmentStart);
        const sliceEnd = Math.min(segments[i].size, end - segmentStart);
        if (sliceStart < sliceEnd) {
          resultSegments.push(segments[i].slice(sliceStart, sliceEnd));
        }
      }
      return new Blob(resultSegments);
    }
    get firstSpliceIndex() {
      return this.spliceOperations[0]?.start ?? Infinity;
    }
    /**
     * Read the spliced blob content and returns it as an ArrayBuffer.
     */
    async arrayBuffer() {
      const segments = this.segments;
      const buffers = await Promise.all(segments.map((segment) => segment.arrayBuffer()));
      const totalSize = sum(buffers.map((buffer) => buffer.byteLength));
      const result = new Uint8Array(totalSize);
      let offset = 0;
      for (const buffer of buffers) {
        result.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
      }
      return result.buffer;
    }
    /**
     * Read the spliced blob content and returns it as a string.
     */
    async text() {
      const buffer = await this.arrayBuffer();
      return new TextDecoder().decode(buffer);
    }
    /**
     * Returns a stream around the spliced blob content.
     */
    stream() {
      const readable = new ReadableStream({
        start: async (controller) => {
          try {
            const segments = this.segments;
            for (const segment of segments) {
              const reader = segment.stream().getReader();
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    break;
                  }
                  controller.enqueue(value);
                }
              } finally {
                reader.releaseLock();
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
      return readable;
    }
    /**
     * Get all segments that make up the spliced blob.
     * This includes original blob segments between splice operations and insert blobs.
     */
    get segments() {
      const segments = [];
      let currentPosition = 0;
      const sortedOps = [...this.spliceOperations].sort((a, b) => a.start - b.start);
      for (const op of sortedOps) {
        if (currentPosition < op.start) {
          segments.push(this.originalBlob.slice(currentPosition, op.start));
        }
        if (op.insert.size > 0) {
          segments.push(op.insert);
        }
        currentPosition = op.end;
      }
      if (currentPosition < this.originalBlob.size) {
        segments.push(this.originalBlob.slice(currentPosition));
      }
      return segments;
    }
  };
  var RANGE_EDIT_CACHE_MAX_ENTRIES = 10;
  function addToRangeEditCache(cache, xetHash, entry) {
    cache.delete(xetHash);
    cache.set(xetHash, entry);
    while (cache.size > RANGE_EDIT_CACHE_MAX_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest === void 0) {
        break;
      }
      cache.delete(oldest);
    }
  }
  async function planRangeEdit(spliced, original, params) {
    const originalHash = original.hash;
    const originalSize = original.size;
    if (!originalHash || originalSize === 0 || original.start !== 0) {
      return void 0;
    }
    if (params.rangeEditCache) {
      const cached2 = planRangeEditFromCache(spliced, originalHash, originalSize, params.rangeEditCache);
      if (cached2) {
        return cached2;
      }
    }
    const token = await xetWriteToken(params);
    const reconstructionResp = await (params.fetch ?? fetch)(`${token.casUrl}/v2/reconstructions/${originalHash}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` }
    });
    if (!reconstructionResp.ok) {
      return void 0;
    }
    const reconstruction = await reconstructionResp.json();
    const terms = reconstruction.terms.map((term) => ({
      hash: term.hash,
      unpackedLength: term.unpacked_length,
      range: { start: term.range.start, end: term.range.end }
    }));
    const segByteStarts = [0];
    let acc = 0;
    for (const term of terms) {
      acc += term.unpackedLength;
      segByteStarts.push(acc);
    }
    if (acc !== originalSize) {
      throw new Error(
        `Original file size mismatch: reconstruction reports ${acc} bytes but the blob is ${originalSize} bytes`
      );
    }
    const edits = spliced.spliceOperations;
    const dirtyRanges = snapAndCoalesceDirtyRanges(edits, segByteStarts, originalSize);
    if (dirtyRanges.length === 0) {
      return void 0;
    }
    const rangeHeader = "bytes=" + dirtyRanges.map(([start, end]) => `${start}-${end - 1}`).join(",");
    const resp = await (params.fetch ?? fetch)(`${token.casUrl}/v2/file-chunk-hashes/${originalHash}`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "X-Range-Dirty": rangeHeader
      }
    });
    if (!resp.ok) {
      return void 0;
    }
    const chunkHashes = await resp.json();
    if (chunkHashes.windows.length === 0) {
      throw new Error("Server returned no windows for range edit");
    }
    if (chunkHashes.hashRanges.length !== chunkHashes.windows.length + 1) {
      throw new Error(
        `Server returned ${chunkHashes.hashRanges.length} hashRanges, expected ${chunkHashes.windows.length + 1}`
      );
    }
    const windows = assignEditsToWindows(
      chunkHashes.windows.map((w) => ({ start: w.dirtyByteRange[0], end: w.dirtyByteRange[1] })),
      edits,
      originalSize,
      segByteStarts
    );
    return {
      originalHash,
      originalSize,
      newSize: spliced.size,
      terms,
      segByteStarts,
      windows,
      hashRanges: chunkHashes.hashRanges,
      gapVerification: chunkHashes.gapVerification
    };
  }
  function planRangeEditFromCache(spliced, originalHash, originalSize, cache) {
    const entry = cache.get(originalHash);
    if (!entry || entry.size !== originalSize || entry.terms.length === 0) {
      return void 0;
    }
    const edits = spliced.spliceOperations;
    if (edits.length === 0) {
      return void 0;
    }
    const lastTerm = entry.terms[entry.terms.length - 1];
    const lastTermStart = originalSize - lastTerm.unpackedLength;
    for (const edit of edits) {
      const editStart = edit.start === edit.end && edit.start === originalSize ? originalSize : edit.start;
      if (editStart < lastTermStart) {
        return void 0;
      }
    }
    const segByteStarts = [0];
    let acc = 0;
    for (const term of entry.terms) {
      acc += term.unpackedLength;
      segByteStarts.push(acc);
    }
    const windows = assignEditsToWindows(
      [{ start: lastTermStart, end: originalSize }],
      edits,
      originalSize,
      segByteStarts
    );
    return {
      originalHash,
      originalSize,
      newSize: spliced.size,
      terms: entry.terms,
      segByteStarts,
      windows,
      hashRanges: [entry.openSubtree, null],
      gapVerification: entry.terms.slice(0, -1).map((term) => term.rangeHash)
    };
  }
  function snapAndCoalesceDirtyRanges(edits, segByteStarts, originalSize) {
    const nSegs = segByteStarts.length - 1;
    const snapStart = (byte) => {
      let idx = 0;
      while (idx + 1 < segByteStarts.length && segByteStarts[idx + 1] <= byte) {
        idx++;
      }
      return segByteStarts[idx];
    };
    const snapEnd = (byte) => {
      let idx = 0;
      while (idx < segByteStarts.length && segByteStarts[idx] < byte) {
        idx++;
      }
      return segByteStarts[Math.min(idx, segByteStarts.length - 1)];
    };
    const snapped = [];
    for (const edit of edits) {
      if (edit.start === edit.end) {
        if (edit.start === originalSize) {
          snapped.push([segByteStarts[nSegs - 1], segByteStarts[nSegs]]);
        } else {
          snapped.push([snapStart(edit.start), snapEnd(edit.start + 1)]);
        }
      } else {
        snapped.push([snapStart(edit.start), snapEnd(edit.end)]);
      }
    }
    snapped.sort((a, b) => a[0] - b[0]);
    const coalesced = [];
    for (const range2 of snapped) {
      const last = coalesced[coalesced.length - 1];
      if (last && range2[0] <= last[1]) {
        last[1] = Math.max(last[1], range2[1]);
        continue;
      }
      coalesced.push([range2[0], range2[1]]);
    }
    return coalesced;
  }
  function assignEditsToWindows(windows, edits, originalSize, segByteStarts) {
    let editIdx = 0;
    const result = [];
    for (const [windowIdx, window2] of windows.entries()) {
      const assigned = [];
      while (editIdx < edits.length) {
        const edit = edits[editIdx];
        const belongsHere = edit.start === edit.end ? edit.start < window2.end || edit.start === window2.end && window2.end === originalSize : edit.end <= window2.end;
        if (!belongsHere) {
          break;
        }
        if (edit.start < window2.start) {
          throw new Error(
            `Edit at [${edit.start}, ${edit.end}) starts before its window [${window2.start}, ${window2.end})`
          );
        }
        assigned.push(edit);
        editIdx++;
      }
      let removed = 0;
      let added = 0;
      for (const edit of assigned) {
        removed += edit.end - edit.start;
        added += edit.insert.size;
      }
      const effectiveEnd = segByteStarts.find((segStart) => segStart >= window2.end);
      if (effectiveEnd === void 0) {
        throw new Error(`Window end ${window2.end} exceeds the file size ${segByteStarts[segByteStarts.length - 1]}`);
      }
      const nextWindowStart = windows[windowIdx + 1]?.start;
      if (nextWindowStart !== void 0 && effectiveEnd > nextWindowStart) {
        throw new Error(
          `Window [${window2.start}, ${window2.end}) extends to term boundary ${effectiveEnd}, overlapping the next window at ${nextWindowStart}`
        );
      }
      result.push({
        start: window2.start,
        end: window2.end,
        effectiveEnd,
        edits: assigned,
        newSize: effectiveEnd - window2.start + added - removed,
        hashSplitSize: window2.end - window2.start + added - removed
      });
    }
    if (editIdx !== edits.length) {
      throw new Error(`${edits.length - editIdx} edits were not assigned to any window`);
    }
    return result;
  }
  function windowSegments(window2, original) {
    const segments = [];
    let cursor = window2.start;
    for (const edit of window2.edits) {
      if (cursor < edit.start) {
        segments.push(original.slice(cursor, edit.start));
      }
      if (edit.insert.size > 0) {
        segments.push(edit.insert);
      }
      cursor = edit.end;
    }
    if (cursor < window2.effectiveEnd) {
      segments.push(original.slice(cursor, window2.effectiveEnd));
    }
    return segments;
  }
  function composeRepresentation(plan, windowRepresentations) {
    const representation = [];
    const nSegs = plan.terms.length;
    let segIdx = 0;
    let gapIdx = 0;
    const reuseTerm = (idx) => {
      const rangeHash = plan.gapVerification[gapIdx];
      if (rangeHash === void 0) {
        throw new Error(`Ran out of gapVerification entries at stable term ${idx}`);
      }
      gapIdx++;
      representation.push({
        xorbId: plan.terms[idx].hash,
        indexStart: plan.terms[idx].range.start,
        indexEnd: plan.terms[idx].range.end,
        length: plan.terms[idx].unpackedLength,
        rangeHash
      });
    };
    for (let i = 0; i < plan.windows.length; i++) {
      const window2 = plan.windows[i];
      while (segIdx < nSegs && plan.segByteStarts[segIdx] < window2.start) {
        if (plan.segByteStarts[segIdx + 1] > window2.start) {
          throw new Error(
            `Window starting at ${window2.start} straddles term ${segIdx} (${plan.segByteStarts[segIdx]}..${plan.segByteStarts[segIdx + 1]})`
          );
        }
        reuseTerm(segIdx);
        segIdx++;
      }
      while (segIdx < nSegs && plan.segByteStarts[segIdx] < window2.effectiveEnd) {
        segIdx++;
      }
      representation.push(...windowRepresentations[i]);
    }
    while (segIdx < nSegs) {
      reuseTerm(segIdx);
      segIdx++;
    }
    if (gapIdx < plan.gapVerification.length) {
      throw new Error(
        `Server returned ${plan.gapVerification.length} gapVerification entries but only ${gapIdx} stable terms were emitted`
      );
    }
    return representation;
  }
  var ZERO_KEY2 = new Uint8Array(32);
  function chunkSplitIndex(chunks, size, context) {
    let cumulative = 0;
    let index = 0;
    while (index < chunks.length && cumulative < size) {
      cumulative += chunks[index].length;
      index++;
    }
    if (cumulative !== size) {
      throw new Error(`${context}: expected a chunk boundary at ${size} bytes, got ${cumulative}`);
    }
    return index;
  }
  function buildRangeEditCachePayload(plan, windowChunks, representation) {
    if (plan.hashRanges[plan.hashRanges.length - 1] !== null) {
      return void 0;
    }
    const lastRep = representation[representation.length - 1];
    const lastWindow = windowChunks[windowChunks.length - 1];
    if (!lastRep || !lastWindow) {
      return void 0;
    }
    const lastTermChunkCount = lastRep.indexEnd - lastRep.indexStart;
    if (lastTermChunkCount <= 0 || lastTermChunkCount > lastWindow.length) {
      return void 0;
    }
    const lastTermChunks = lastWindow.slice(lastWindow.length - lastTermChunkCount);
    const hashRanges = plan.hashRanges.map((json) => json === null ? null : MerkleHashSubtree.fromJSON(json));
    const firstWindowAtStart = hashRanges[0] === null;
    const sequence = [];
    for (let i = 0; i < plan.windows.length; i++) {
      const gap = hashRanges[i];
      if (gap !== null && gap !== void 0) {
        sequence.push(gap);
      }
      const splitIndex = chunkSplitIndex(windowChunks[i], plan.windows[i].hashSplitSize, "buildRangeEditCachePayload");
      let chunks = windowChunks[i].slice(0, splitIndex);
      if (i === plan.windows.length - 1) {
        chunks = chunks.slice(0, chunks.length - lastTermChunkCount);
      }
      if (chunks.length > 0 || i === 0 && firstWindowAtStart) {
        sequence.push(
          MerkleHashSubtree.fromChunks(
            i === 0 && firstWindowAtStart,
            chunks.map((chunk2) => ({ hash: hexToBytes(chunk2.hash), length: chunk2.length })),
            false
          )
        );
      }
    }
    const openSubtree = sequence.length > 0 ? MerkleHashSubtree.merge(sequence) : null;
    return {
      size: plan.newSize,
      openSubtree: openSubtree && !openSubtree.isEmpty ? openSubtree.toJSON() : null,
      lastTermChunks
    };
  }
  function buildFreshFileCachePayload(fileChunks, representation) {
    const lastRep = representation[representation.length - 1];
    if (!lastRep) {
      return void 0;
    }
    const lastTermChunkCount = lastRep.indexEnd - lastRep.indexStart;
    if (lastTermChunkCount <= 0 || lastTermChunkCount > fileChunks.length) {
      return void 0;
    }
    const lastTermChunks = fileChunks.slice(fileChunks.length - lastTermChunkCount);
    const rest = fileChunks.slice(0, fileChunks.length - lastTermChunkCount);
    const openSubtree = rest.length > 0 ? MerkleHashSubtree.fromChunks(
      true,
      rest.map((chunk2) => ({ hash: hexToBytes(chunk2.hash), length: chunk2.length })),
      false
    ).toJSON() : null;
    return {
      size: fileChunks.reduce((sum2, chunk2) => sum2 + chunk2.length, 0),
      openSubtree,
      lastTermChunks
    };
  }
  function computeComposedFileHash(plan, windowChunks) {
    if (plan.newSize === 0) {
      return "0".repeat(64);
    }
    const hashRanges = plan.hashRanges.map((json) => json === null ? null : MerkleHashSubtree.fromJSON(json));
    const trailingGap = hashRanges[hashRanges.length - 1];
    const firstWindowAtStart = hashRanges[0] === null;
    const lastWindowAtEnd = trailingGap === null;
    const lastIdx = plan.windows.length - 1;
    const mergeSequence = [];
    for (let i = 0; i < plan.windows.length; i++) {
      const gap = hashRanges[i];
      if (gap !== null) {
        mergeSequence.push(gap);
      }
      const window2 = plan.windows[i];
      const splitIndex = chunkSplitIndex(
        windowChunks[i],
        window2.hashSplitSize,
        `Window [${window2.start}, ${window2.end}) chunk boundaries did not re-sync at the window end`
      );
      mergeSequence.push(
        MerkleHashSubtree.fromChunks(
          i === 0 && firstWindowAtStart,
          windowChunks[i].slice(0, splitIndex).map((chunk2) => ({ hash: hexToBytes(chunk2.hash), length: chunk2.length })),
          i === lastIdx && lastWindowAtEnd
        )
      );
    }
    if (trailingGap !== null && trailingGap !== void 0) {
      mergeSequence.push(trailingGap);
    }
    const merged = MerkleHashSubtree.merge(mergeSequence);
    const aggregated = merged.finalHash();
    if (aggregated === void 0) {
      throw new Error("Merged subtree is not fully closed; cannot derive the file hash");
    }
    return hashToHex(hmac(aggregated, ZERO_KEY2));
  }
  var TARGET_CHUNK_SIZE2 = 64 * 1024;
  var MAX_CHUNK_SIZE = 2 * TARGET_CHUNK_SIZE2;
  var XORB_SIZE = 64 * 1024 * 1024;
  var MAX_XORB_CHUNKS = 8 * 1024;
  var INTERVAL_BETWEEN_REMOTE_DEDUP = 4e6;
  var PROCESSING_PROGRESS_RATIO = 0.1;
  var UPLOADING_PROGRESS_RATIO = 1 - PROCESSING_PROGRESS_RATIO;
  function computeXorbHashHex(chunks) {
    const chunkObjs = chunks.map((c) => ({ hash: hexToBytes(c.hash), length: c.length }));
    return hashToHex(xorbHash(chunkObjs));
  }
  function computeHmacHex(hash22, key) {
    return hashToHex(hmac(hexToBytes(hash22), hexToBytes(key)));
  }
  function computeVerificationHashHex(hashes) {
    return hashToHex(verificationHash(hashes.map(hexToBytes)));
  }
  function computeFileHashHex(chunks) {
    const chunkObjs = chunks.map((c) => ({ hash: hexToBytes(c.hash), length: c.length }));
    return hashToHex(fileHash(chunkObjs));
  }
  function addDataToChunker(data, chunker) {
    return nextBlock(chunker, data).map((c) => ({ hash: hashToHex(c.hash), length: c.length, dedup: false }));
  }
  function finalizeChunker(chunker) {
    const last = finalize(chunker);
    if (!last) {
      return [];
    }
    return [{ hash: hashToHex(last.hash), length: last.length, dedup: false }];
  }
  var CurrentXorbInfo = class {
    constructor() {
      __publicField(this, "id");
      __publicField(this, "offset");
      __publicField(this, "chunks");
      __publicField(this, "fileProcessedBytes");
      __publicField(this, "fileUploadedBytes");
      __publicField(this, "fileSize");
      __publicField(this, "data");
      __publicField(this, "immutableData");
      this.id = 0;
      this.offset = 0;
      this.chunks = [];
      this.fileProcessedBytes = {};
      this.fileUploadedBytes = {};
      this.fileSize = {};
      this.data = new Uint8Array(XORB_SIZE);
      this.immutableData = null;
    }
    event(computeXorbHash) {
      const xorbChunksCleaned = this.chunks.map((chunk2) => ({
        hash: chunk2.hash,
        length: chunk2.length
      }));
      return {
        event: "xorb",
        xorb: this.data.subarray(0, this.offset),
        hash: computeXorbHash(xorbChunksCleaned),
        chunks: xorbChunksCleaned,
        id: this.id,
        files: Object.entries(this.fileProcessedBytes).map(([path, processedBytes]) => ({
          path,
          progress: processedBytes / this.fileSize[path],
          lastSentProgress: ((this.fileUploadedBytes[path] ?? 0) + (processedBytes - (this.fileUploadedBytes[path] ?? 0)) * PROCESSING_PROGRESS_RATIO) / this.fileSize[path]
        }))
      };
    }
  };
  async function* createXorbs(fileSources, params) {
    const alreadyDoneFileSha256s = /* @__PURE__ */ new Set();
    let xorbId = 0;
    const chunkCache = new ChunkCache();
    let xorb = new CurrentXorbInfo();
    const nextXorb = (currentFile) => {
      const event = xorb.event(computeXorbHashHex);
      xorbId++;
      xorb = new CurrentXorbInfo();
      xorb.id = xorbId;
      xorb.fileUploadedBytes = {
        [currentFile.path]: currentFile.uploadedBytes
      };
      xorb.fileSize[currentFile.path] = currentFile.size;
      return event;
    };
    const pendingFileEvents = [];
    const remoteXorbHashes = [""];
    const resolveXorbId = (xorbId2) => typeof xorbId2 === "string" ? xorbId2 : xorbId2 >= 0 ? xorbId2 : remoteXorbHashes[-xorbId2];
    for await (const fileSource of fileSources) {
      params.yieldCallback?.({
        event: "fileProgress",
        path: fileSource.path,
        progress: 0
      });
      if (fileSource.sha256 && alreadyDoneFileSha256s.has(fileSource.sha256)) {
        params.yieldCallback?.({
          event: "fileProgress",
          path: fileSource.path,
          progress: 1
        });
        continue;
      }
      if (fileSource.sha256) {
        alreadyDoneFileSha256s.add(fileSource.sha256);
      }
      {
        xorb.fileSize[fileSource.path] = fileSource.content.size;
        let rangeEditPlan;
        if (fileSource.content instanceof SplicedBlob && fileSource.content.originalBlob instanceof XetBlob && fileSource.content.originalBlob.hash !== void 0 && fileSource.content.originalBlob.size > 0) {
          rangeEditPlan = await planRangeEdit(fileSource.content, fileSource.content.originalBlob, params);
        }
        if (fileSource.content instanceof SplicedBlob && (rangeEditPlan !== void 0 || fileSource.content.firstSpliceIndex < MAX_CHUNK_SIZE)) {
          await loadFirstChunkDedupInfo(fileSource.content, remoteXorbHashes, params, chunkCache);
        }
        let bytesSinceRemoteDedup = Infinity;
        let bytesSinceLastProgressEvent = 0;
        let dedupNextChunk = true;
        const sourceChunks = [];
        let processedBytes = 0;
        let dedupedBytes = 0;
        const fileChunks = [];
        const chunkMetadata = [];
        const addChunks = async function* (chunks) {
          var _a4, _b, _c, _d;
          for (const chunk2 of chunks) {
            if (dedupNextChunk) {
              chunk2.dedup = true;
              dedupNextChunk = false;
            }
            let chunkIndex = xorb.chunks.length;
            let chunkXorbId = xorbId;
            const chunkToCopy = removeChunkFromSourceData(sourceChunks, chunk2.length);
            let cacheData = chunkCache.getChunk(chunk2.hash, computeHmacHex);
            if (cacheData === void 0 && chunk2.dedup && bytesSinceRemoteDedup >= INTERVAL_BETWEEN_REMOTE_DEDUP) {
              const token = await xetWriteToken(params);
              bytesSinceRemoteDedup = 0;
              const shardResp = await (params.fetch ?? fetch)(token.casUrl + "/v1/chunks/default/" + chunk2.hash, {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`
                }
              });
              if (shardResp.ok) {
                const shard = await shardResp.blob();
                const shardData = await parseShardData(shard);
                for (const xorb2 of shardData.xorbs) {
                  const remoteXorbId = -remoteXorbHashes.length;
                  remoteXorbHashes.push(xorb2.hash);
                  let i = 0;
                  for (const chunk3 of xorb2.chunks) {
                    chunkCache.addChunkToCache(chunk3.hash, remoteXorbId, i++, shardData.hmacKey);
                  }
                }
                cacheData = chunkCache.getChunk(chunk2.hash, computeHmacHex);
                const oldDedupedBytes = dedupedBytes;
                dedupedBytes = backtrackDedup(xorb, computeHmacHex, shardData, chunkCache, chunkMetadata, dedupedBytes);
                if (dedupedBytes > oldDedupedBytes) {
                  (_a4 = xorb.fileUploadedBytes)[_b = fileSource.path] ?? (_a4[_b] = 0);
                  xorb.fileUploadedBytes[fileSource.path] += dedupedBytes - oldDedupedBytes;
                }
              }
            }
            if (cacheData === void 0) {
              if (!writeChunk(xorb, chunkToCopy, chunk2.hash)) {
                yield nextXorb({ path: fileSource.path, uploadedBytes: processedBytes, size: fileSource.content.size });
                chunkIndex = 0;
                chunkXorbId = xorbId;
                for (const event of pendingFileEvents) {
                  event.representation = event.representation.map((rep) => ({
                    ...rep,
                    xorbId: resolveXorbId(rep.xorbId)
                  }));
                  yield event;
                }
                pendingFileEvents.length = 0;
                if (!writeChunk(xorb, chunkToCopy, chunk2.hash)) {
                  throw new Error("Failed to write chunk into xorb");
                }
              }
              chunkCache.addChunkToCache(chunk2.hash, xorbId, chunkIndex, null);
            } else {
              chunkXorbId = cacheData.xorbIndex;
              chunkIndex = cacheData.chunkIndex;
              dedupedBytes += chunk2.length;
              (_c = xorb.fileUploadedBytes)[_d = fileSource.path] ?? (_c[_d] = 0);
              xorb.fileUploadedBytes[fileSource.path] += chunk2.length;
            }
            bytesSinceRemoteDedup += chunk2.length;
            bytesSinceLastProgressEvent += chunk2.length;
            fileChunks.push({ hash: chunk2.hash, length: chunk2.length });
            chunkMetadata.push({
              xorbId: chunkXorbId,
              chunkIndex,
              length: chunk2.length
            });
            xorb.fileProcessedBytes[fileSource.path] = processedBytes;
            if (bytesSinceLastProgressEvent >= 1e6) {
              bytesSinceLastProgressEvent = 0;
              params.yieldCallback?.({
                event: "fileProgress",
                path: fileSource.path,
                progress: ((xorb.fileUploadedBytes[fileSource.path] ?? 0) + (xorb.fileProcessedBytes[fileSource.path] - (xorb.fileUploadedBytes[fileSource.path] ?? 0)) * PROCESSING_PROGRESS_RATIO) / fileSource.content.size
              });
            }
            if (xorb.chunks.length >= MAX_XORB_CHUNKS) {
              yield nextXorb({ path: fileSource.path, uploadedBytes: processedBytes, size: fileSource.content.size });
              for (const event of pendingFileEvents) {
                event.representation = event.representation.map((rep) => ({
                  ...rep,
                  xorbId: resolveXorbId(rep.xorbId)
                }));
                yield event;
              }
              pendingFileEvents.length = 0;
            }
          }
        };
        const pumpBlob = async function* (chunker, blob) {
          const reader = blob.stream().getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            processedBytes += value.length;
            sourceChunks.push(value);
            yield* addChunks(addDataToChunker(value, chunker));
          }
        };
        let fileRepresentation;
        let fileHashHex;
        let dedupRatio;
        let rangeEditCachePayload;
        if (rangeEditPlan !== void 0) {
          const originalBlob = fileSource.content.originalBlob;
          const windowBounds = [];
          for (const window2 of rangeEditPlan.windows) {
            const chunker = createChunker(TARGET_CHUNK_SIZE2);
            dedupNextChunk = true;
            const startIndex = fileChunks.length;
            for (const segment of windowSegments(window2, originalBlob)) {
              yield* pumpBlob(chunker, segment);
            }
            yield* addChunks(finalizeChunker(chunker));
            windowBounds.push([startIndex, fileChunks.length]);
          }
          const windowNewBytes = sum(rangeEditPlan.windows.map((window2) => window2.newSize));
          const reusedBytes = fileSource.content.size - windowNewBytes;
          processedBytes += reusedBytes;
          xorb.fileUploadedBytes[fileSource.path] = (xorb.fileUploadedBytes[fileSource.path] ?? 0) + reusedBytes;
          xorb.fileProcessedBytes[fileSource.path] = processedBytes;
          const windowRepresentations = windowBounds.map(
            ([start, end]) => buildFileRepresentation(
              chunkMetadata.slice(start, end),
              fileChunks.slice(start, end),
              computeVerificationHashHex
            )
          );
          fileRepresentation = composeRepresentation(rangeEditPlan, windowRepresentations);
          fileHashHex = computeComposedFileHash(
            rangeEditPlan,
            windowBounds.map(([start, end]) => fileChunks.slice(start, end))
          );
          dedupRatio = fileSource.content.size > 0 ? (reusedBytes + dedupedBytes) / fileSource.content.size : 0;
          if (params.rangeEditCache) {
            rangeEditCachePayload = buildRangeEditCachePayload(
              rangeEditPlan,
              windowBounds.map(([start, end]) => fileChunks.slice(start, end)),
              fileRepresentation
            );
          }
        } else {
          const chunker = createChunker(TARGET_CHUNK_SIZE2);
          yield* pumpBlob(chunker, fileSource.content);
          yield* addChunks(finalizeChunker(chunker));
          fileRepresentation = buildFileRepresentation(chunkMetadata, fileChunks, computeVerificationHashHex);
          fileHashHex = computeFileHashHex(fileChunks);
          dedupRatio = fileSource.content.size > 0 ? dedupedBytes / fileSource.content.size : 0;
          if (params.rangeEditCache) {
            rangeEditCachePayload = buildFreshFileCachePayload(fileChunks, fileRepresentation);
          }
        }
        xorb.immutableData = {
          chunkIndex: xorb.chunks.length,
          offset: xorb.offset
        };
        pendingFileEvents.push({
          event: "file",
          path: fileSource.path,
          hash: fileHashHex,
          sha256: fileSource.sha256,
          dedupRatio,
          representation: fileRepresentation,
          rangeEditCachePayload
        });
      }
    }
    if (xorb.offset > 0) {
      yield xorb.event(computeXorbHashHex);
    }
    for (const event of pendingFileEvents) {
      event.representation = event.representation.map((rep) => ({
        ...rep,
        xorbId: resolveXorbId(rep.xorbId)
      }));
      yield event;
    }
  }
  function backtrackDedup(xorb, computeHmac, shardData, chunkCache, chunkMetadata, dedupedBytes) {
    const chunkIndexesToBacktrackFor = /* @__PURE__ */ new Map();
    for (let chunkToRecheckIndex = xorb.immutableData?.chunkIndex ?? 0; chunkToRecheckIndex < xorb.chunks.length; chunkToRecheckIndex++) {
      const chunk2 = xorb.chunks[chunkToRecheckIndex];
      const hmacHash = computeHmac(chunk2.hash, shardData.hmacKey);
      const cacheData = chunkCache.getChunk(hmacHash, null);
      if (cacheData !== void 0) {
        chunkIndexesToBacktrackFor.set(chunkToRecheckIndex, {
          xorbId: cacheData.xorbIndex,
          chunkIndex: cacheData.chunkIndex
        });
        chunkCache.removeChunkFromCache(chunk2.hash);
      }
    }
    for (const metadata of chunkMetadata) {
      if (metadata.xorbId === xorb.id && chunkIndexesToBacktrackFor.has(metadata.chunkIndex)) {
        const backtrackData = chunkIndexesToBacktrackFor.get(metadata.chunkIndex);
        if (backtrackData !== void 0) {
          metadata.xorbId = backtrackData.xorbId;
          metadata.chunkIndex = backtrackData.chunkIndex;
          dedupedBytes += metadata.length;
        }
      }
    }
    const xorbRangesToErase = [];
    for (let i = 0; i < xorb.chunks.length; i++) {
      const chunk2 = xorb.chunks[i];
      if (chunkIndexesToBacktrackFor.has(i)) {
        xorbRangesToErase.push({
          start: chunk2.offset,
          end: i < xorb.chunks.length - 1 ? xorb.chunks[i + 1].offset : xorb.offset
        });
      }
    }
    const xorbRangesToKeep = [];
    let currentStart = 0;
    for (let i = 0; i < xorbRangesToErase.length; i++) {
      const range2 = xorbRangesToErase[i];
      if (currentStart !== range2.start) {
        xorbRangesToKeep.push({ start: currentStart, end: range2.start });
      }
      currentStart = range2.end;
    }
    if (currentStart !== xorb.offset) {
      xorbRangesToKeep.push({ start: currentStart, end: xorb.offset });
    }
    let currentOffset = 0;
    for (const range2 of xorbRangesToKeep) {
      if (range2.start !== currentOffset) {
        xorb.data.set(xorb.data.subarray(range2.start, range2.end), currentOffset);
      }
      currentOffset += range2.end - range2.start;
    }
    const newXorbChunks = [];
    const oldIndexToNewIndex = /* @__PURE__ */ new Map();
    let erasedOffset = 0;
    for (let i = 0; i < xorb.chunks.length; i++) {
      const chunk2 = xorb.chunks[i];
      if (chunkIndexesToBacktrackFor.has(i)) {
        if (i < xorb.chunks.length - 1) {
          erasedOffset += xorb.chunks[i + 1].offset - chunk2.offset;
        }
      } else {
        newXorbChunks.push({
          hash: chunk2.hash,
          length: chunk2.length,
          offset: chunk2.offset - erasedOffset
        });
        if (erasedOffset > 0) {
          oldIndexToNewIndex.set(i, newXorbChunks.length - 1);
        }
      }
    }
    xorb.chunks = newXorbChunks;
    xorb.offset = currentOffset;
    for (const chunk2 of chunkMetadata) {
      if (chunk2.xorbId === xorb.id) {
        const newIndex = oldIndexToNewIndex.get(chunk2.chunkIndex);
        if (newIndex !== void 0) {
          const cached2 = chunkCache.getChunk(xorb.chunks[newIndex].hash, null);
          if (cached2 !== void 0 && cached2.xorbIndex === chunk2.xorbId && cached2.chunkIndex === chunk2.chunkIndex) {
            chunkCache.updateChunkIndex(xorb.chunks[newIndex].hash, newIndex);
          }
          chunk2.chunkIndex = newIndex;
        }
      }
    }
    return dedupedBytes;
  }
  function removeChunkFromSourceData(sourceChunks, chunkLength) {
    if (chunkLength === sourceChunks[0].length) {
      const chunkToCopy = sourceChunks[0];
      sourceChunks.shift();
      return chunkToCopy;
    } else if (chunkLength < sourceChunks[0].length) {
      const chunkToCopy = sourceChunks[0].subarray(0, chunkLength);
      sourceChunks[0] = sourceChunks[0].subarray(chunkLength);
      return chunkToCopy;
    } else {
      const chunkToCopy = new Uint8Array(chunkLength);
      let copyOffset = 0;
      let index = 0;
      let toSlice = -1;
      while (copyOffset < chunkLength) {
        const nToCopy = Math.min(sourceChunks[index].length, chunkLength - copyOffset);
        chunkToCopy.set(sourceChunks[index].subarray(0, nToCopy), copyOffset);
        copyOffset += nToCopy;
        if (nToCopy === sourceChunks[index].length) {
          index++;
        } else {
          toSlice = nToCopy;
        }
      }
      sourceChunks.splice(0, index);
      if (toSlice !== -1) {
        sourceChunks[0] = sourceChunks[0].subarray(toSlice);
      }
      return chunkToCopy;
    }
  }
  function writeChunk(xorb, chunk2, hash22) {
    const regularCompressedChunk = compress2(chunk2);
    const bgCompressedChunk = compress2(bg4_split_bytes(chunk2));
    const compressedChunk = bgCompressedChunk.length < regularCompressedChunk.length ? bgCompressedChunk : regularCompressedChunk;
    const chunkToWrite = compressedChunk.length < chunk2.length ? compressedChunk : chunk2;
    if (xorb.offset + XET_CHUNK_HEADER_BYTES + chunkToWrite.length > XORB_SIZE) {
      return false;
    }
    xorb.data[xorb.offset] = 0;
    xorb.data[xorb.offset + 1] = chunkToWrite.length & 255;
    xorb.data[xorb.offset + 2] = chunkToWrite.length >> 8 & 255;
    xorb.data[xorb.offset + 3] = chunkToWrite.length >> 16 & 255;
    xorb.data[xorb.offset + 4] = chunkToWrite.length < chunk2.length ? bgCompressedChunk.length < regularCompressedChunk.length ? 2 : 1 : 0;
    xorb.data[xorb.offset + 5] = chunk2.length & 255;
    xorb.data[xorb.offset + 6] = chunk2.length >> 8 & 255;
    xorb.data[xorb.offset + 7] = chunk2.length >> 16 & 255;
    xorb.data.set(chunkToWrite, xorb.offset + XET_CHUNK_HEADER_BYTES);
    xorb.chunks.push({ hash: hash22, length: chunk2.length, offset: xorb.offset });
    xorb.offset += XET_CHUNK_HEADER_BYTES + chunkToWrite.length;
    return true;
  }
  var buildFileRepresentation = (metadata, chunks, computeVerificationHash) => {
    if (metadata.length === 0) {
      return [];
    }
    const representation = [];
    let currentRange = {
      xorbId: metadata[0].xorbId,
      indexStart: metadata[0].chunkIndex,
      indexEnd: metadata[0].chunkIndex + 1,
      length: metadata[0].length,
      chunkHashStart: 0
    };
    for (let i = 1; i < metadata.length; i++) {
      const chunk2 = metadata[i];
      if (currentRange.xorbId === chunk2.xorbId && currentRange.indexEnd === chunk2.chunkIndex) {
        currentRange.indexEnd = chunk2.chunkIndex + 1;
        currentRange.length += chunk2.length;
      } else {
        const rangeHash2 = computeVerificationHash(chunks.slice(currentRange.chunkHashStart, i).map((x) => x.hash));
        representation.push({
          xorbId: currentRange.xorbId,
          indexStart: currentRange.indexStart,
          indexEnd: currentRange.indexEnd,
          length: currentRange.length,
          rangeHash: rangeHash2
        });
        currentRange = {
          xorbId: chunk2.xorbId,
          indexStart: chunk2.chunkIndex,
          indexEnd: chunk2.chunkIndex + 1,
          length: chunk2.length,
          chunkHashStart: i
        };
      }
    }
    const rangeHash = computeVerificationHash(chunks.slice(currentRange.chunkHashStart).map((x) => x.hash));
    representation.push({
      xorbId: currentRange.xorbId,
      indexStart: currentRange.indexStart,
      indexEnd: currentRange.indexEnd,
      length: currentRange.length,
      rangeHash
    });
    return representation;
  };
  async function loadFirstChunkDedupInfo(content, remoteXorbHashes, params, chunkCache) {
    await loadDedupInfoToCache(
      content.originalBlob.slice(0, MAX_CHUNK_SIZE),
      remoteXorbHashes,
      params,
      chunkCache,
      computeHmacHex,
      {
        maxChunks: 1,
        isAtBeginning: true
      }
    );
  }
  async function loadDedupInfoToCache(content, remoteXorbHashes, params, chunkCache, computeHmacHex2, opts) {
    const chunker = createChunker(TARGET_CHUNK_SIZE2);
    const cache = chunkCache;
    let dedupedBytes = 0;
    let chunksProcessed = 0;
    let totalBytes = 0;
    let bytesSinceRemoteDedup = Infinity;
    const sourceChunks = [];
    const reader = content.stream().getReader();
    const processChunks = async (chunks) => {
      for (const chunk2 of chunks) {
        chunksProcessed++;
        if (opts?.isAtBeginning && chunksProcessed === 1) {
          chunk2.dedup = true;
        }
        totalBytes += chunk2.length;
        removeChunkFromSourceData(sourceChunks, chunk2.length);
        let cacheData = cache.getChunk(chunk2.hash, computeHmacHex2);
        if (cacheData !== void 0) {
          dedupedBytes += chunk2.length;
          bytesSinceRemoteDedup += chunk2.length;
          continue;
        }
        if (chunk2.dedup && bytesSinceRemoteDedup >= INTERVAL_BETWEEN_REMOTE_DEDUP) {
          const token = await xetWriteToken(params);
          bytesSinceRemoteDedup = 0;
          const shardResp = await (params.fetch ?? fetch)(token.casUrl + "/v1/chunks/default/" + chunk2.hash, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`
            }
          });
          if (shardResp.ok) {
            const shard = await shardResp.blob();
            const shardData = await parseShardData(shard);
            for (const xorb of shardData.xorbs) {
              const remoteXorbId = -remoteXorbHashes.length;
              remoteXorbHashes.push(xorb.hash);
              let i = 0;
              for (const xorbChunk of xorb.chunks) {
                cache.addChunkToCache(xorbChunk.hash, remoteXorbId, i++, shardData.hmacKey);
              }
            }
            cacheData = cache.getChunk(chunk2.hash, computeHmacHex2);
          }
        }
        if (cacheData !== void 0) {
          dedupedBytes += chunk2.length;
        }
        bytesSinceRemoteDedup += chunk2.length;
      }
    };
    while (true) {
      if (opts?.end !== void 0 && totalBytes >= opts.end) {
        break;
      }
      if (opts?.maxChunks !== void 0 && chunksProcessed >= opts.maxChunks) {
        break;
      }
      const { done, value } = await reader.read();
      if (done) {
        await processChunks(finalizeChunker(chunker));
        break;
      }
      sourceChunks.push(value);
      await processChunks(addDataToChunker(value, chunker));
    }
  }
  var SHARD_MAX_SIZE = 64 * 1024 * 1024;
  var SHARD_HEADER_SIZE = 48;
  var SHARD_FOOTER_SIZE = 200;
  var HASH_LENGTH2 = 32;
  var XORB_FOOTER_LENGTH = 48;
  var FILE_FOOTER_LENGTH = 48;
  var SHARD_HEADER_VERSION = 2n;
  var SHARD_FOOTER_VERSION = 1n;
  var MDB_FILE_FLAG_WITH_VERIFICATION = 2147483648;
  var MDB_FILE_FLAG_WITH_METADATA_EXT = 1073741824;
  var SHARD_MAGIC_TAG = new Uint8Array([
    "H".charCodeAt(0),
    "F".charCodeAt(0),
    "R".charCodeAt(0),
    "e".charCodeAt(0),
    "p".charCodeAt(0),
    "o".charCodeAt(0),
    "M".charCodeAt(0),
    "e".charCodeAt(0),
    "t".charCodeAt(0),
    "a".charCodeAt(0),
    "D".charCodeAt(0),
    "a".charCodeAt(0),
    "t".charCodeAt(0),
    "a".charCodeAt(0),
    0,
    85,
    105,
    103,
    69,
    106,
    123,
    129,
    87,
    131,
    165,
    189,
    217,
    92,
    205,
    209,
    74,
    169
  ]);
  async function* uploadShards(source, params) {
    const xorbHashes = [];
    const seenFileXetHashes = /* @__PURE__ */ new Set();
    const fileInfoSection = new Uint8Array(Math.floor(SHARD_MAX_SIZE - SHARD_HEADER_SIZE - SHARD_FOOTER_SIZE) * 0.25);
    const xorbInfoSection = new Uint8Array(Math.floor(SHARD_MAX_SIZE - SHARD_HEADER_SIZE - SHARD_FOOTER_SIZE) * 0.75);
    const xorbView = new DataView(xorbInfoSection.buffer);
    let xorbViewOffset = 0;
    const fileInfoView = new DataView(fileInfoSection.buffer);
    let fileViewOffset = 0;
    let xorbTotalSize = 0n;
    let fileTotalSize = 0n;
    let xorbTotalUnpackedSize = 0n;
    for await (const output of createXorbs(source, params)) {
      switch (output.event) {
        case "xorb": {
          xorbHashes.push(output.hash);
          const xorbEntrySize = HASH_LENGTH2 + 4 + 4 + 4 + 4;
          const chunksSize = output.chunks.length * (HASH_LENGTH2 + 4 + 4 + 8);
          const totalXorbSize = xorbEntrySize + chunksSize;
          if (xorbViewOffset + totalXorbSize > xorbInfoSection.length) {
            if (xorbViewOffset > 0 || fileViewOffset > 0) {
              await uploadShard(createShard(), params);
            }
          }
          writeHashToArray(output.hash, xorbInfoSection, xorbViewOffset);
          xorbViewOffset += HASH_LENGTH2;
          xorbView.setUint32(xorbViewOffset, 0, true);
          xorbViewOffset += 4;
          xorbView.setUint32(xorbViewOffset, output.chunks.length, true);
          xorbViewOffset += 4;
          const xorbUnpackedSize = sum(output.chunks.map((x) => x.length));
          xorbView.setUint32(xorbViewOffset, xorbUnpackedSize, true);
          xorbTotalUnpackedSize += BigInt(xorbUnpackedSize);
          xorbTotalSize += BigInt(output.xorb.byteLength);
          xorbViewOffset += 4;
          xorbView.setUint32(xorbViewOffset, output.xorb.byteLength, true);
          xorbViewOffset += 4;
          let chunkBytes = 0;
          for (const chunk2 of output.chunks) {
            writeHashToArray(chunk2.hash, xorbInfoSection, xorbViewOffset);
            xorbViewOffset += HASH_LENGTH2;
            xorbView.setUint32(xorbViewOffset, chunkBytes, true);
            xorbViewOffset += 4;
            xorbView.setUint32(xorbViewOffset, chunk2.length, true);
            xorbViewOffset += 4;
            xorbView.setBigUint64(xorbViewOffset, 0n, true);
            xorbViewOffset += 8;
            chunkBytes += chunk2.length;
          }
          for (const file of output.files) {
            yield {
              event: "fileProgress",
              path: file.path,
              progress: file.lastSentProgress
            };
          }
          await uploadXorb(output, params);
          for (const file of output.files) {
            yield { event: "fileProgress", path: file.path, progress: file.progress };
          }
          break;
        }
        case "file": {
          yield {
            event: "file",
            path: output.path,
            xetHash: output.hash,
            sha256: output.sha256,
            dedupRatio: output.dedupRatio
          };
          if (params.rangeEditCache && output.rangeEditCachePayload) {
            addToRangeEditCache(params.rangeEditCache, output.hash, {
              size: output.rangeEditCachePayload.size,
              terms: output.representation.map((rep) => ({
                hash: typeof rep.xorbId === "number" ? xorbHashes[rep.xorbId] : rep.xorbId,
                unpackedLength: rep.length,
                range: { start: rep.indexStart, end: rep.indexEnd },
                rangeHash: rep.rangeHash
              })),
              openSubtree: output.rangeEditCachePayload.openSubtree,
              lastTermChunks: output.rangeEditCachePayload.lastTermChunks
            });
          }
          if (seenFileXetHashes.has(output.hash)) {
            break;
          }
          seenFileXetHashes.add(output.hash);
          const fileHeaderSize = HASH_LENGTH2 + 4 + 4 + 8;
          const representationSize = output.representation.length * (HASH_LENGTH2 + 4 + 4 + 4 + 4);
          const verificationSize = output.representation.length * (HASH_LENGTH2 + 16);
          const fileSha256 = output.sha256;
          const hasMetadataExt = fileSha256 !== void 0;
          const metadataSize = hasMetadataExt ? HASH_LENGTH2 + 16 : 0;
          const totalFileSize = fileHeaderSize + representationSize + verificationSize + metadataSize;
          if (fileViewOffset + totalFileSize > fileInfoSection.length) {
            if (xorbViewOffset > 0 || fileViewOffset > 0) {
              await uploadShard(createShard(), params);
            }
          }
          writeHashToArray(output.hash, fileInfoSection, fileViewOffset);
          fileViewOffset += HASH_LENGTH2;
          fileInfoView.setUint32(
            fileViewOffset,
            MDB_FILE_FLAG_WITH_VERIFICATION + (hasMetadataExt ? MDB_FILE_FLAG_WITH_METADATA_EXT : 0),
            true
          );
          fileViewOffset += 4;
          fileInfoView.setUint32(fileViewOffset, output.representation.length, true);
          fileViewOffset += 4;
          fileInfoView.setBigUint64(fileViewOffset, 0n, true);
          fileViewOffset += 8;
          for (const repItem of output.representation) {
            writeHashToArray(
              typeof repItem.xorbId === "number" ? xorbHashes[repItem.xorbId] : repItem.xorbId,
              fileInfoSection,
              fileViewOffset
            );
            fileViewOffset += HASH_LENGTH2;
            fileInfoView.setUint32(fileViewOffset, 0, true);
            fileViewOffset += 4;
            fileInfoView.setUint32(fileViewOffset, repItem.length, true);
            fileViewOffset += 4;
            fileInfoView.setUint32(fileViewOffset, repItem.indexStart, true);
            fileViewOffset += 4;
            fileInfoView.setUint32(fileViewOffset, repItem.indexEnd, true);
            fileViewOffset += 4;
          }
          for (const repItem of output.representation) {
            writeHashToArray(repItem.rangeHash, fileInfoSection, fileViewOffset);
            fileViewOffset += HASH_LENGTH2;
            for (let i = 0; i < 16; i++) {
              fileInfoSection[fileViewOffset + i] = 0;
            }
            fileViewOffset += 16;
          }
          if (hasMetadataExt) {
            writeHashToArray(fileSha256, fileInfoSection, fileViewOffset);
            fileViewOffset += HASH_LENGTH2;
            for (let i = 0; i < 16; i++) {
              fileInfoSection[fileViewOffset + i] = 0;
            }
            fileViewOffset += 16;
          }
          break;
        }
      }
    }
    function createShard() {
      const shard = new Uint8Array(
        SHARD_HEADER_SIZE + SHARD_FOOTER_SIZE + xorbViewOffset + XORB_FOOTER_LENGTH + fileViewOffset + FILE_FOOTER_LENGTH
      );
      const shardView = new DataView(shard.buffer);
      let shardOffset = 0;
      shard.set(SHARD_MAGIC_TAG, shardOffset);
      shardOffset += SHARD_MAGIC_TAG.length;
      shardView.setBigUint64(shardOffset, SHARD_HEADER_VERSION, true);
      shardOffset += 8;
      shardView.setBigUint64(shardOffset, BigInt(SHARD_FOOTER_SIZE), true);
      shardOffset += 8;
      shard.set(fileInfoSection.slice(0, fileViewOffset), shardOffset);
      shardOffset += fileViewOffset;
      for (let i = 0; i < 32; i++) {
        shard[shardOffset + i] = 255;
      }
      shardOffset += 32;
      for (let i = 0; i < 16; i++) {
        shard[shardOffset + i] = 0;
      }
      shardOffset += 16;
      const xorbInfoOffset = shardOffset;
      shard.set(xorbInfoSection.slice(0, xorbViewOffset), shardOffset);
      shardOffset += xorbViewOffset;
      for (let i = 0; i < 32; i++) {
        shard[shardOffset + i] = 255;
      }
      shardOffset += 32;
      for (let i = 0; i < 16; i++) {
        shard[shardOffset + i] = 0;
      }
      shardOffset += 16;
      const footerOffset = shardOffset;
      shardView.setBigUint64(shardOffset, SHARD_FOOTER_VERSION, true);
      shardOffset += 8;
      shardView.setBigUint64(shardOffset, BigInt(SHARD_HEADER_SIZE), true);
      shardOffset += 8;
      shardView.setBigUint64(shardOffset, BigInt(xorbInfoOffset), true);
      shardOffset += 8;
      for (let i = 0; i < 48; i++) {
        shardView.setUint8(shardOffset + i, 0);
      }
      shardOffset += 48;
      for (let i = 0; i < 32; i++) {
        shardView.setUint8(shardOffset + i, 0);
      }
      shardOffset += 32;
      shardView.setBigUint64(shardOffset, BigInt(Math.floor(Date.now() / 1e3)), true);
      shardOffset += 8;
      shardView.setBigUint64(shardOffset, 0n, true);
      shardOffset += 8;
      for (let i = 0; i < 48; i++) {
        shardView.setUint8(shardOffset + i, 0);
      }
      shardOffset += 48;
      shardView.setBigUint64(shardOffset, xorbTotalSize, true);
      shardOffset += 8;
      shardView.setBigUint64(shardOffset, fileTotalSize, true);
      shardOffset += 8;
      shardView.setBigUint64(shardOffset, xorbTotalUnpackedSize, true);
      shardOffset += 8;
      shardView.setBigUint64(shardOffset, BigInt(footerOffset), true);
      xorbViewOffset = 0;
      fileViewOffset = 0;
      xorbTotalSize = 0n;
      xorbTotalUnpackedSize = 0n;
      fileTotalSize = 0n;
      return shard;
    }
    if (xorbViewOffset || fileViewOffset) {
      await uploadShard(createShard(), params);
    }
  }
  function writeHashToArray(hash22, array, offset) {
    for (let i = 0; i < hash22.length; i += 16) {
      array[offset + i / 2] = parseInt(hash22.substring(i + 2 * 7, i + 2 * 8), 16);
      array[offset + i / 2 + 1] = parseInt(hash22.substring(i + 2 * 6, i + 2 * 7), 16);
      array[offset + i / 2 + 2] = parseInt(hash22.substring(i + 2 * 5, i + 2 * 6), 16);
      array[offset + i / 2 + 3] = parseInt(hash22.substring(i + 2 * 4, i + 2 * 5), 16);
      array[offset + i / 2 + 4] = parseInt(hash22.substring(i + 2 * 3, i + 2 * 4), 16);
      array[offset + i / 2 + 5] = parseInt(hash22.substring(i + 2 * 2, i + 2 * 3), 16);
      array[offset + i / 2 + 6] = parseInt(hash22.substring(i + 2 * 1, i + 2 * 2), 16);
      array[offset + i / 2 + 7] = parseInt(hash22.substring(i + 2 * 0, i + 2 * 1), 16);
    }
  }
  async function uploadXorb(xorb, params) {
    const token = await xetWriteToken(params);
    const resp = await (params.fetch ?? fetch)(`${token.casUrl}/v1/xorbs/default/${xorb.hash}`, {
      method: "POST",
      body: xorb.xorb,
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        ...params.xetParams.sessionId ? { "X-Xet-Session-Id": params.xetParams.sessionId } : {}
      },
      ...{
        progressHint: {
          progressCallback: (progress) => {
            for (const file of xorb.files) {
              params.yieldCallback?.({
                event: "fileProgress",
                path: file.path,
                progress: file.lastSentProgress + (file.progress - file.lastSentProgress) * progress
              });
            }
          }
        }
      }
    });
    if (!resp.ok) {
      throw await createApiError(resp);
    }
  }
  async function uploadShard(shard, params) {
    const token = await xetWriteToken(params);
    const resp = await (params.fetch ?? fetch)(`${token.casUrl}/v1/shards`, {
      method: "POST",
      body: shard,
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        ...params.xetParams.sessionId ? { "X-Xet-Session-Id": params.xetParams.sessionId } : {}
      }
    });
    if (!resp.ok) {
      throw await createApiError(resp);
    }
  }
  function splitAsyncGenerator(source, n) {
    if (n <= 0) {
      return [];
    }
    const sleep = (ms) => new Promise((resolve2) => setTimeout(resolve2, ms));
    let takenIndex = null;
    const generators = [];
    let remaining = n;
    for (let i = 0; i < n; i++) {
      generators.push({
        next: async () => {
          while (takenIndex !== null) {
            await sleep(1);
          }
          takenIndex = i;
          return source.next().then((r) => {
            takenIndex = null;
            return r;
          });
        },
        return: async () => {
          remaining--;
          if (remaining === 0) {
            return source.return(void 0);
          }
          return {
            done: true,
            value: void 0
          };
        },
        throw: async (error) => {
          return source.throw(error);
        },
        [Symbol.asyncIterator]: () => generators[i]
      });
    }
    return generators;
  }
  var CONCURRENT_SHAS = 5;
  var CONCURRENT_LFS_UPLOADS = 5;
  var MULTIPART_PARALLEL_UPLOAD = 5;
  function isFileOperation(op) {
    const ret = op.operation === "addOrUpdate";
    if (ret && !(op.content instanceof Blob)) {
      throw new TypeError("Precondition failed: op.content should be a Blob");
    }
    return ret;
  }
  async function* commitIter(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    if (repoId.type === "bucket") {
      return yield* commitIterBucket(params);
    }
    if (params.operations.some((op) => op.operation === "copy")) {
      throw new Error("'copy' operations are only supported when the destination repo is a bucket");
    }
    yield { event: "phase", phase: "preuploading" };
    let useXet = params.useXet ?? true;
    const lfsShas = /* @__PURE__ */ new Map();
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    if (!abortSignal.throwIfAborted) {
      abortSignal.throwIfAborted = () => {
        if (abortSignal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
      };
    }
    if (params.abortSignal) {
      params.abortSignal.addEventListener("abort", () => abortController.abort());
    }
    try {
      const allOperations = (await Promise.all(
        params.operations.map(async (operation) => {
          if (operation.operation === "edit") {
            const splicedBlob = SplicedBlob.create(
              operation.originalContent,
              operation.edits.map((splice) => ({ insert: splice.content, start: splice.start, end: splice.end }))
            );
            return {
              operation: "addOrUpdate",
              path: operation.path,
              content: splicedBlob
            };
          }
          if (operation.operation !== "addOrUpdate") {
            return operation;
          }
          if (!(operation.content instanceof URL)) {
            return { ...operation, content: operation.content };
          }
          const lazyBlobs = await createBlobs(operation.content, operation.path, {
            fetch: params.fetch,
            maxFolderDepth: params.maxFolderDepth
          });
          abortSignal?.throwIfAborted();
          return lazyBlobs.map((blob) => ({
            ...operation,
            content: blob.blob,
            path: blob.path
          }));
        })
      )).flat(1);
      const gitAttributes = allOperations.filter(isFileOperation).find((op) => op.path === ".gitattributes")?.content;
      for (const operations of chunk(allOperations.filter(isFileOperation), 100)) {
        const payload = {
          gitAttributes: gitAttributes && await gitAttributes.text(),
          files: await Promise.all(
            operations.map(async (operation) => ({
              path: operation.path,
              size: operation.content.size,
              sample: base64FromBytes(new Uint8Array(await operation.content.slice(0, 512).arrayBuffer()))
            }))
          )
        };
        abortSignal?.throwIfAborted();
        const res = await (params.fetch ?? fetch)(
          `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/preupload/${encodeURIComponent(
            params.branch ?? "main"
          )}` + (params.isPullRequest ? "?create_pr=1" : ""),
          {
            method: "POST",
            headers: {
              ...accessToken && { Authorization: `Bearer ${accessToken}` },
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal: abortSignal
          }
        );
        if (!res.ok) {
          throw await createApiError(res);
        }
        const json = await res.json();
        for (const file of json.files) {
          if (file.uploadMode === "lfs") {
            lfsShas.set(file.path, null);
          }
        }
      }
      yield { event: "phase", phase: "uploadingLargeFiles" };
      for (const operations of chunk(
        allOperations.filter(isFileOperation).filter((op) => lfsShas.has(op.path)),
        100
      )) {
        const shas = yield* eventToGenerator((yieldCallback, returnCallback, rejectCallack) => {
          return promisesQueue(
            operations.map((op) => async () => {
              const iterator = sha256(op.content, { useWebWorker: params.useWebWorkers, abortSignal });
              let res2;
              do {
                res2 = await iterator.next();
                if (!res2.done) {
                  yieldCallback({ event: "fileProgress", path: op.path, progress: res2.value, state: "hashing" });
                }
              } while (!res2.done);
              const sha = res2.value;
              lfsShas.set(op.path, res2.value);
              return sha;
            }),
            CONCURRENT_SHAS
          ).then(returnCallback, rejectCallack);
        });
        abortSignal?.throwIfAborted();
        const payload = {
          operation: "upload",
          // multipart is a custom protocol for HF
          transfers: ["basic", "multipart", ...useXet ? ["xet"] : []],
          hash_algo: "sha_256",
          ...!params.isPullRequest && {
            ref: {
              name: params.branch ?? "main"
            }
          },
          objects: operations.map((op, i) => ({
            oid: shas[i],
            size: op.content.size
          }))
        };
        const res = await (params.fetch ?? fetch)(
          `${params.hubUrl ?? HUB_URL}/${repoId.type === "model" ? "" : repoId.type + "s/"}${repoId.name}.git/info/lfs/objects/batch`,
          {
            method: "POST",
            headers: {
              ...accessToken && { Authorization: `Bearer ${accessToken}` },
              Accept: "application/vnd.git-lfs+json",
              "Content-Type": "application/vnd.git-lfs+json"
            },
            body: JSON.stringify(payload),
            signal: abortSignal
          }
        );
        if (!res.ok) {
          throw await createApiError(res);
        }
        const json = await res.json();
        const batchRequestId = res.headers.get("X-Request-Id") || void 0;
        const shaToOperation = new Map(operations.map((op, i) => [shas[i], op]));
        if (useXet && json.transfer !== "xet") {
          useXet = false;
        }
        let xetParams = null;
        if (useXet) {
          for (const obj of json.objects) {
            const op = shaToOperation.get(obj.oid);
            if (!op) {
              throw new InvalidApiResponseFormatError("Unrequested object ID in response");
            }
            if (obj.error) {
              const errorMessage = `Error while doing LFS batch call for ${operations[shas.indexOf(obj.oid)].path}: ${obj.error.message}${batchRequestId ? ` - Request ID: ${batchRequestId}` : ""}`;
              throw new HubApiError(res.url, obj.error.code, batchRequestId, errorMessage);
            }
            if (!obj.actions?.upload) {
              yield {
                event: "fileProgress",
                path: op.path,
                progress: 1,
                state: "uploading"
              };
            } else {
              const headers = new Headers(obj.actions.upload.header);
              xetParams = {
                sessionId: headers.get("X-Xet-Session-Id") ?? void 0,
                casUrl: headers.get("X-Xet-Cas-Url") ?? void 0,
                accessToken: headers.get("X-Xet-Access-Token") ?? void 0,
                expiresAt: headers.get("X-Xet-Token-Expiration") ? new Date(parseInt(headers.get("X-Xet-Token-Expiration") ?? "0") * 1e3) : void 0,
                refreshWriteTokenUrl: obj.actions.upload.href
              };
            }
          }
          const source = async function* () {
            for (const obj of json.objects) {
              const op = shaToOperation.get(obj.oid);
              if (!op || !obj.actions?.upload) {
                continue;
              }
              abortSignal?.throwIfAborted();
              yield { content: op.content, path: op.path, sha256: obj.oid };
            }
          }();
          if (xetParams) {
            const fixedXetParams = xetParams;
            const sources = splitAsyncGenerator(source, 5);
            yield* eventToGenerator(
              (yieldCallback, returnCallback, rejectCallback) => Promise.all(
                sources.map(async function(source2) {
                  for await (const event of uploadShards(source2, {
                    fetch: params.fetch,
                    accessToken,
                    hubUrl: params.hubUrl ?? HUB_URL,
                    repo: repoId,
                    xetParams: fixedXetParams,
                    // todo: maybe leave empty if PR?
                    rev: params.branch ?? "main",
                    isPullRequest: params.isPullRequest,
                    rangeEditCache: params.rangeEditCache,
                    yieldCallback: (event2) => yieldCallback({ ...event2, state: "uploading" })
                  })) {
                    if (event.event === "file") {
                      yieldCallback({
                        event: "fileProgress",
                        path: event.path,
                        progress: 1,
                        state: "uploading"
                      });
                    } else if (event.event === "fileProgress") {
                      yieldCallback({
                        event: "fileProgress",
                        path: event.path,
                        progress: event.progress,
                        state: "uploading"
                      });
                    }
                  }
                })
              ).then(() => returnCallback(void 0), rejectCallback)
            );
          } else {
          }
        } else {
          yield* eventToGenerator((yieldCallback, returnCallback, rejectCallback) => {
            return promisesQueueStreaming(
              json.objects.map((obj) => async () => {
                const op = shaToOperation.get(obj.oid);
                if (!op) {
                  throw new InvalidApiResponseFormatError("Unrequested object ID in response");
                }
                abortSignal?.throwIfAborted();
                if (obj.error) {
                  const errorMessage = `Error while doing LFS batch call for ${operations[shas.indexOf(obj.oid)].path}: ${obj.error.message}${batchRequestId ? ` - Request ID: ${batchRequestId}` : ""}`;
                  throw new HubApiError(res.url, obj.error.code, batchRequestId, errorMessage);
                }
                if (!obj.actions?.upload) {
                  yieldCallback({
                    event: "fileProgress",
                    path: op.path,
                    progress: 1,
                    state: "uploading"
                  });
                  return;
                }
                yieldCallback({
                  event: "fileProgress",
                  path: op.path,
                  progress: 0,
                  state: "uploading"
                });
                const content = op.content;
                const header = obj.actions.upload.header;
                if (header?.chunk_size) {
                  const chunkSize = parseInt(header.chunk_size);
                  const completionUrl = obj.actions.upload.href;
                  const parts = Object.keys(header).filter((key) => /^[0-9]+$/.test(key));
                  if (parts.length !== Math.ceil(content.size / chunkSize)) {
                    throw new Error("Invalid server response to upload large LFS file, wrong number of parts");
                  }
                  const completeReq = {
                    oid: obj.oid,
                    parts: parts.map((part) => ({
                      partNumber: +part,
                      etag: ""
                    }))
                  };
                  const progressCallback = (progress) => yieldCallback({ event: "fileProgress", path: op.path, progress, state: "uploading" });
                  await promisesQueueStreaming(
                    parts.map((part) => async () => {
                      abortSignal?.throwIfAborted();
                      const index = parseInt(part) - 1;
                      const slice = content.slice(index * chunkSize, (index + 1) * chunkSize);
                      const res3 = await (params.fetch ?? fetch)(header[part], {
                        method: "PUT",
                        /** Unfortunately, browsers don't support our inherited version of Blob in fetch calls */
                        body: slice instanceof WebBlob && isFrontend ? await slice.arrayBuffer() : slice,
                        signal: abortSignal,
                        ...{
                          progressHint: {
                            path: op.path,
                            part: index,
                            numParts: parts.length,
                            progressCallback
                          }
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        }
                      });
                      if (!res3.ok) {
                        throw await createApiError(res3, {
                          requestId: batchRequestId,
                          message: `Error while uploading part ${part} of ${operations[shas.indexOf(obj.oid)].path} to LFS storage`
                        });
                      }
                      const eTag = res3.headers.get("ETag");
                      if (!eTag) {
                        throw new Error("Cannot get ETag of part during multipart upload");
                      }
                      completeReq.parts[Number(part) - 1].etag = eTag;
                    }),
                    MULTIPART_PARALLEL_UPLOAD
                  );
                  abortSignal?.throwIfAborted();
                  const res2 = await (params.fetch ?? fetch)(completionUrl, {
                    method: "POST",
                    body: JSON.stringify(completeReq),
                    headers: {
                      Accept: "application/vnd.git-lfs+json",
                      "Content-Type": "application/vnd.git-lfs+json"
                    },
                    signal: abortSignal
                  });
                  if (!res2.ok) {
                    throw await createApiError(res2, {
                      requestId: batchRequestId,
                      message: `Error completing multipart upload of ${operations[shas.indexOf(obj.oid)].path} to LFS storage`
                    });
                  }
                  yieldCallback({
                    event: "fileProgress",
                    path: op.path,
                    progress: 1,
                    state: "uploading"
                  });
                } else {
                  const res2 = await (params.fetch ?? fetch)(obj.actions.upload.href, {
                    method: "PUT",
                    headers: {
                      ...batchRequestId ? { "X-Request-Id": batchRequestId } : void 0
                    },
                    /** Unfortunately, browsers don't support our inherited version of Blob in fetch calls */
                    body: content instanceof WebBlob && isFrontend ? await content.arrayBuffer() : content,
                    signal: abortSignal,
                    ...{
                      progressHint: {
                        path: op.path,
                        progressCallback: (progress) => yieldCallback({
                          event: "fileProgress",
                          path: op.path,
                          progress,
                          state: "uploading"
                        })
                      }
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    }
                  });
                  if (!res2.ok) {
                    throw await createApiError(res2, {
                      requestId: batchRequestId,
                      message: `Error while uploading ${operations[shas.indexOf(obj.oid)].path} to LFS storage`
                    });
                  }
                  yieldCallback({
                    event: "fileProgress",
                    path: op.path,
                    progress: 1,
                    state: "uploading"
                  });
                }
              }),
              CONCURRENT_LFS_UPLOADS
            ).then(returnCallback, rejectCallback);
          });
        }
      }
      abortSignal?.throwIfAborted();
      yield { event: "phase", phase: "committing" };
      return yield* eventToGenerator(
        async (yieldCallback, returnCallback, rejectCallback) => (params.fetch ?? fetch)(
          `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/commit/${encodeURIComponent(
            params.branch ?? "main"
          )}` + (params.isPullRequest ? "?create_pr=1" : ""),
          {
            method: "POST",
            headers: {
              ...accessToken && { Authorization: `Bearer ${accessToken}` },
              "Content-Type": "application/x-ndjson"
            },
            body: [
              {
                key: "header",
                value: {
                  summary: params.title,
                  description: params.description,
                  parentCommit: params.parentCommit
                }
              },
              ...await Promise.all(
                allOperations.map((operation) => {
                  if (isFileOperation(operation)) {
                    const sha = lfsShas.get(operation.path);
                    if (sha) {
                      return {
                        key: "lfsFile",
                        value: {
                          path: operation.path,
                          algo: "sha256",
                          size: operation.content.size,
                          oid: sha
                        }
                      };
                    }
                  }
                  return convertOperationToNdJson(operation);
                })
              )
            ].map((x) => JSON.stringify(x)).join("\n"),
            signal: abortSignal,
            ...{
              progressHint: {
                progressCallback: (progress) => {
                  for (const op of allOperations) {
                    if (isFileOperation(op) && !lfsShas.has(op.path)) {
                      yieldCallback({
                        event: "fileProgress",
                        path: op.path,
                        progress,
                        state: "uploading"
                      });
                    }
                  }
                }
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
          }
        ).then(async (res) => {
          if (!res.ok) {
            throw await createApiError(res);
          }
          const json = await res.json();
          returnCallback({
            pullRequestUrl: json.pullRequestUrl,
            commit: {
              oid: json.commitOid,
              url: json.commitUrl
            },
            hookOutput: json.hookOutput
          });
        }).catch(rejectCallback)
      );
    } catch (err) {
      abortController.abort();
      throw err;
    }
  }
  async function* commitIterBucket(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    if (params.useXet === false) {
      throw new Error("useXet must be true or undefined for buckets");
    }
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    if (!abortSignal.throwIfAborted) {
      abortSignal.throwIfAborted = () => {
        if (abortSignal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
      };
    }
    if (params.abortSignal) {
      params.abortSignal.addEventListener("abort", () => abortController.abort());
    }
    try {
      const allOperations = (await Promise.all(
        params.operations.map(async (operation) => {
          if (operation.operation === "edit") {
            const splicedBlob = SplicedBlob.create(
              operation.originalContent,
              operation.edits.map((splice) => ({ insert: splice.content, start: splice.start, end: splice.end }))
            );
            return {
              operation: "addOrUpdate",
              path: operation.path,
              content: splicedBlob
            };
          }
          if (operation.operation !== "addOrUpdate") {
            return operation;
          }
          if (!(operation.content instanceof URL)) {
            return { ...operation, content: operation.content };
          }
          const lazyBlobs = await createBlobs(operation.content, operation.path, {
            fetch: params.fetch,
            maxFolderDepth: params.maxFolderDepth
          });
          abortSignal?.throwIfAborted();
          return lazyBlobs.map((blob) => ({
            ...operation,
            content: blob.blob,
            path: blob.path
          }));
        })
      )).flat(1);
      yield { event: "phase", phase: "uploadingLargeFiles" };
      for (const operations of chunk(allOperations.filter(isFileOperation), 100)) {
        const xetHashes = /* @__PURE__ */ new Map();
        abortSignal?.throwIfAborted();
        const source = async function* () {
          for (const operation of operations) {
            abortSignal?.throwIfAborted();
            yield { content: operation.content, path: operation.path };
          }
        }();
        const xetParams = {
          sessionId: crypto.randomUUID(),
          refreshWriteTokenUrl: `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/xet-write-token`
        };
        const sources = splitAsyncGenerator(source, 5);
        yield* eventToGenerator(
          (yieldCallback, returnCallback, rejectCallback) => Promise.all(
            sources.map(async function(source2) {
              for await (const event of uploadShards(source2, {
                fetch: params.fetch,
                accessToken,
                hubUrl: params.hubUrl ?? HUB_URL,
                repo: repoId,
                xetParams,
                rev: params.branch ?? "main",
                rangeEditCache: params.rangeEditCache,
                yieldCallback: (event2) => yieldCallback({ ...event2, state: "uploading" })
              })) {
                if (event.event === "file") {
                  yieldCallback({
                    event: "fileProgress",
                    path: event.path,
                    progress: 1,
                    state: "uploading"
                  });
                  xetHashes.set(event.path, event.xetHash);
                } else if (event.event === "fileProgress") {
                  yieldCallback({
                    event: "fileProgress",
                    path: event.path,
                    progress: event.progress,
                    state: "uploading"
                  });
                }
              }
            })
          ).then(() => returnCallback(void 0), rejectCallback)
        );
        const resp = await (params.fetch ?? fetch)(
          `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/batch`,
          {
            method: "POST",
            headers: {
              ...accessToken && { Authorization: `Bearer ${accessToken}` },
              "Content-Type": "application/x-ndjson"
            },
            body: [...xetHashes.entries()].map(
              ([path, xetHash]) => JSON.stringify({
                type: "addFile",
                path,
                xetHash
              })
            ).join("\n"),
            signal: abortSignal
          }
        );
        if (!resp.ok && resp.status !== 422) {
          throw await createApiError(resp);
        }
        const json = await resp.json();
        for (const failed of json.failed) {
          yield {
            event: "fileProgress",
            path: failed.path,
            progress: 0,
            state: "error"
          };
        }
      }
      abortSignal?.throwIfAborted();
      const copyOperations = allOperations.filter(
        (operation) => operation.operation === "copy"
      );
      for (const copyChunk of chunk(copyOperations, 100)) {
        abortSignal?.throwIfAborted();
        const resp = await (params.fetch ?? fetch)(
          `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/batch`,
          {
            method: "POST",
            headers: {
              ...accessToken && { Authorization: `Bearer ${accessToken}` },
              "Content-Type": "application/x-ndjson"
            },
            body: copyChunk.map((op) => {
              const sourceRepoId = toRepoId(op.sourceRepo);
              return JSON.stringify({
                type: "copyFile",
                path: op.path,
                xetHash: op.sourceXetHash,
                sourceRepoType: sourceRepoId.type,
                sourceRepoId: sourceRepoId.name
              });
            }).join("\n"),
            signal: abortSignal
          }
        );
        if (!resp.ok && resp.status !== 422) {
          throw await createApiError(resp);
        }
        const json = await resp.json();
        for (const failed of json.failed) {
          yield {
            event: "fileProgress",
            path: failed.path,
            progress: 0,
            state: "error"
          };
        }
      }
      abortSignal?.throwIfAborted();
      const deletedOperations = allOperations.filter((operation) => operation.operation === "delete");
      if (deletedOperations.length > 0) {
        const resp = await (params.fetch ?? fetch)(
          `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/batch`,
          {
            method: "POST",
            headers: {
              ...accessToken && { Authorization: `Bearer ${accessToken}` },
              "Content-Type": "application/x-ndjson"
            },
            body: deletedOperations.map(
              (operation) => JSON.stringify({
                type: "deleteFile",
                path: operation.path
              })
            ).join("\n"),
            signal: abortSignal
          }
        );
        if (!resp.ok) {
          throw await createApiError(resp);
        }
        const json = await resp.json();
        if (json.failed.length > 0) {
          const failedPaths = json.failed.slice(0, 5).map((f) => f.path);
          throw new Error(
            `Failed to delete ${json.failed.length} file(s): ${failedPaths.join(", ")}${json.failed.length > 5 ? "..." : ""}, request ID: ${resp.headers.get("X-Request-Id")}`
          );
        }
      }
      abortSignal?.throwIfAborted();
    } catch (err) {
      abortController.abort();
      throw err;
    }
  }
  async function commit(params) {
    const iterator = commitIter(params);
    const failedPaths = [];
    let failedCount = 0;
    let res = await iterator.next();
    while (!res.done) {
      if (res.value.event === "fileProgress" && res.value.state === "error") {
        failedCount++;
        if (failedPaths.length < 5) {
          failedPaths.push(res.value.path);
        }
      }
      res = await iterator.next();
    }
    if (failedCount > 0) {
      throw new Error(
        `Failed to upload ${failedCount} file(s): ${failedPaths.join(", ")}${failedCount > 5 ? "..." : ""}`
      );
    }
    return res.value;
  }
  async function convertOperationToNdJson(operation) {
    switch (operation.operation) {
      case "addOrUpdate": {
        return {
          key: "file",
          value: {
            content: base64FromBytes(new Uint8Array(await operation.content.arrayBuffer())),
            path: operation.path,
            encoding: "base64"
          }
        };
      }
      case "delete": {
        return {
          key: "deletedFile",
          value: {
            path: operation.path
          }
        };
      }
      case "edit": {
        throw new Error(
          "Edit operations should be converted to addOrUpdate operations before reaching convertOperationToNdJson"
        );
      }
      default:
        throw new TypeError("Unknown operation: " + operation.operation);
    }
  }
  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return `${bytes} B`;
    }
    const units = ["B", "kB", "MB", "GB", "TB", "PB"];
    let value = bytes;
    let i = 0;
    while (value >= 1e3 && i < units.length - 1) {
      value /= 1e3;
      i++;
    }
    const formatted = i === 0 ? value.toString() : value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2);
    return `${formatted} ${units[i]}`;
  }
  function parseLinkHeader(header) {
    const regex = /<(https?:[/][/][^>]+)>;\s+rel="([^"]+)"/g;
    return Object.fromEntries([...header.matchAll(regex)].map(([, url, rel]) => [rel, url]));
  }
  async function fileDownloadInfo(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const hubUrl = params.hubUrl ?? HUB_URL;
    const revision = repoId.type === "bucket" ? void 0 : params.revision ?? "main";
    const url = `${hubUrl}/${repoId.type === "model" ? "" : `${repoId.type}s/`}${repoId.name}/${params.raw ? "raw" : "resolve"}${revision ? `/${encodeURIComponent(revision)}` : ""}/${params.path}` + (params.noContentDisposition ? "?noContentDisposition=1" : "");
    const resp = await (params.fetch ?? fetch)(url, {
      method: "GET",
      headers: {
        ...accessToken && {
          Authorization: `Bearer ${accessToken}`
        },
        Range: "bytes=0-0",
        Accept: "application/vnd.xet-fileinfo+json, */*"
      }
    });
    if (resp.status === 404 && resp.headers.get("X-Error-Code") === "EntryNotFound") {
      return null;
    }
    if (!resp.ok) {
      throw await createApiError(resp);
    }
    let size;
    let xetInfo;
    if (resp.headers.get("Content-Type")?.includes("application/vnd.xet-fileinfo+json")) {
      size = parseInt(resp.headers.get("X-Linked-Size") ?? "invalid");
      if (isNaN(size)) {
        throw new InvalidApiResponseFormatError("Invalid file size received in X-Linked-Size header");
      }
      const hash22 = resp.headers.get("X-Xet-Hash");
      const links = parseLinkHeader(resp.headers.get("Link") ?? "");
      const reconstructionUrl = (() => {
        try {
          return new URL(links["xet-reconstruction-info"]);
        } catch {
          return null;
        }
      })();
      const refreshUrl = (() => {
        try {
          return new URL(links["xet-auth"]);
        } catch {
          return null;
        }
      })();
      if (!hash22) {
        throw new InvalidApiResponseFormatError("No hash received in X-Xet-Hash header");
      }
      if (!reconstructionUrl || !refreshUrl) {
        throw new InvalidApiResponseFormatError("No xet-reconstruction-info or xet-auth link header");
      }
      xetInfo = {
        hash: hash22,
        refreshUrl,
        reconstructionUrl
      };
    }
    if (size === void 0 || isNaN(size)) {
      const contentRangeHeader = resp.headers.get("content-range");
      if (!contentRangeHeader) {
        throw new InvalidApiResponseFormatError("Expected size information");
      }
      const [, parsedSize] = contentRangeHeader.split("/");
      size = parseInt(parsedSize);
      if (isNaN(size)) {
        throw new InvalidApiResponseFormatError("Invalid file size received");
      }
    }
    const etag = resp.headers.get("X-Linked-ETag") ?? resp.headers.get("ETag") ?? void 0;
    if (!etag) {
      throw new InvalidApiResponseFormatError("Expected ETag");
    }
    return {
      etag,
      size,
      xet: xetInfo,
      // Cannot use resp.url in case it's a S3 url and the user adds an Authorization header to it.
      url: resp.url && (new URL(resp.url).origin === new URL(hubUrl).origin || resp.headers.get("X-Cache")?.endsWith(" cloudfront")) ? resp.url : url
    };
  }
  async function downloadFile(params) {
    const accessToken = checkCredentials(params);
    const info = params.downloadInfo ?? await fileDownloadInfo({
      accessToken,
      repo: params.repo,
      path: params.path,
      revision: params.revision,
      hubUrl: params.hubUrl,
      fetch: params.fetch,
      raw: params.raw
    });
    if (!info) {
      return null;
    }
    if (info.xet && params.xet !== false) {
      return new XetBlob({
        refreshUrl: info.xet.refreshUrl.href,
        reconstructionUrl: info.xet.reconstructionUrl.href,
        hash: info.xet.hash,
        fetch: params.fetch,
        accessToken,
        size: info.size,
        readToken: typeof params.xet === "object" ? params.xet.readToken : void 0,
        parallelDownloads: params.parallelDownloads
      });
    }
    return new WebBlob(new URL(info.url), 0, info.size, "", true, params.fetch ?? fetch, accessToken);
  }
  async function* listFiles(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const revision = repoId.type === "bucket" ? void 0 : params.revision || "main";
    let url = `${params.hubUrl || HUB_URL}/api/${repoId.type}s/${repoId.name}/tree${revision ? `/${revision}` : ""}${params.path ? "/" + params.path : ""}?recursive=${!!params.recursive}&expand=${!!params.expand}`;
    while (url) {
      const res = await (params.fetch ?? fetch)(url, {
        headers: {
          accept: "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : void 0
        }
      });
      if (!res.ok) {
        throw await createApiError(res);
      }
      const items = await res.json();
      for (const item of items) {
        yield item;
      }
      const linkHeader = res.headers.get("Link");
      url = linkHeader ? parseLinkHeader(linkHeader).next : void 0;
    }
  }
  async function pathsInfo(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const hubUrl = params.hubUrl ?? HUB_URL;
    const revision = repoId.type === "bucket" ? void 0 : params.revision ?? "main";
    const url = `${hubUrl}/api/${repoId.type}s/${repoId.name}/paths-info${revision ? `/${encodeURIComponent(revision)}` : ""}`;
    const resp = await (params.fetch ?? fetch)(url, {
      method: "POST",
      headers: {
        ...accessToken && {
          Authorization: `Bearer ${accessToken}`
        },
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paths: params.paths,
        expand: params.expand
      })
    });
    if (!resp.ok) {
      throw await createApiError(resp);
    }
    const json = await resp.json();
    if (!Array.isArray(json)) {
      throw new Error("malformed response: expected array");
    }
    return json.map((item) => ({
      path: item.path,
      lfs: item.lfs,
      type: item.type,
      oid: item.oid,
      size: item.size,
      xetHash: item.xetHash,
      uploadedAt: item.uploadedAt,
      securityFileStatus: item.securityFileStatus,
      lastCommit: item.lastCommit ? {
        date: new Date(item.lastCommit.date),
        title: item.lastCommit.title,
        id: item.lastCommit.id
      } : void 0
    }));
  }
  var DOWNLOAD_CONCURRENCY = 5;
  var PATHS_INFO_BATCH_SIZE = 100;
  var MAX_REPORTED_LFS_PATHS = 5;
  function copyFile(params) {
    return copyFiles({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      destination: params.destination.repo,
      files: [
        {
          source: params.source,
          destinationPath: params.destination.path
        }
      ],
      hubUrl: params.hubUrl,
      fetch: params.fetch,
      abortSignal: params.abortSignal
    });
  }
  function copyFileIter(params) {
    return copyFilesIter({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      destination: params.destination.repo,
      files: [
        {
          source: params.source,
          destinationPath: params.destination.path
        }
      ],
      hubUrl: params.hubUrl,
      fetch: params.fetch,
      abortSignal: params.abortSignal
    });
  }
  async function copyFiles(params) {
    const iterator = copyFilesIter(params);
    while (true) {
      const res = await iterator.next();
      if (res.done) {
        return void 0;
      }
    }
  }
  async function* copyFilesIter(params) {
    if (params.files.length === 0) {
      return void 0;
    }
    const operations = yield* resolveCopyOperationsIter(params, params.files);
    await commit({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      repo: params.destination,
      operations,
      title: "",
      hubUrl: params.hubUrl,
      fetch: params.fetch,
      abortSignal: params.abortSignal
    });
    return void 0;
  }
  async function copyFolder(params) {
    const iterator = copyFolderIter(params);
    while (true) {
      const res = await iterator.next();
      if (res.done) {
        return void 0;
      }
    }
  }
  async function* copyFolderIter(params) {
    const accessToken = checkCredentials(params);
    const sourceRepoId = toRepoId(params.source.repo);
    const sourcePath = (params.source.path ?? "").replace(/\/+$/, "");
    const destinationPrefix = (params.destination.path ?? "").replace(/\/+$/, "");
    const sourceRevision = sourceRepoId.type === "bucket" ? void 0 : params.source.revision ?? "main";
    const operations = [];
    const pendingDownloads = [];
    const lfsOffenders = [];
    for await (const item of listFiles({
      repo: sourceRepoId,
      path: sourcePath || void 0,
      recursive: true,
      revision: sourceRevision,
      accessToken,
      hubUrl: params.hubUrl,
      fetch: params.fetch
    })) {
      if (item.type !== "file") {
        continue;
      }
      const relPath = relativeUnderFolder(item.path, sourcePath);
      const destPath = destinationPrefix ? `${destinationPrefix}/${relPath}` : relPath;
      switch (classifySourceFile(item)) {
        case "copy":
          operations.push({
            operation: "copy",
            path: destPath,
            sourceXetHash: item.xetHash,
            sourceRepo: sourceRepoId
          });
          continue;
        case "lfs":
          lfsOffenders.push({ path: item.path, size: item.lfs?.size ?? item.size });
          continue;
        case "download":
          pendingDownloads.push({
            index: operations.length,
            repoId: sourceRepoId,
            revision: sourceRevision,
            sourcePath: item.path
          });
          operations.push({
            operation: "addOrUpdate",
            path: destPath,
            content: new Blob([])
          });
          continue;
      }
    }
    if (lfsOffenders.length > 0) {
      throwUnmigratedLfsError(sourceRepoId, lfsOffenders);
    }
    if (operations.length === 0) {
      return void 0;
    }
    yield* downloadAndFillBlobsIter({
      pendingDownloads,
      operations,
      accessToken,
      hubUrl: params.hubUrl,
      fetch: params.fetch
    });
    await commit({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      repo: params.destination.repo,
      operations,
      title: "",
      hubUrl: params.hubUrl,
      fetch: params.fetch,
      abortSignal: params.abortSignal
    });
    return void 0;
  }
  async function* resolveCopyOperationsIter(shared, files) {
    const accessToken = checkCredentials(shared);
    const groups = /* @__PURE__ */ new Map();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const repoId = toRepoId(file.source.repo);
      const revision = repoId.type === "bucket" ? void 0 : file.source.revision ?? "main";
      const key = `${repoId.type}\0${repoId.name}\0${revision ?? ""}`;
      let group = groups.get(key);
      if (!group) {
        group = { repoId, revision, entries: [] };
        groups.set(key, group);
      }
      group.entries.push({ index: i, file });
    }
    const operations = new Array(files.length);
    const pendingDownloads = [];
    for (const group of groups.values()) {
      const paths = group.entries.map((e) => e.file.source.path);
      const infos = [];
      for (let offset = 0; offset < paths.length; offset += PATHS_INFO_BATCH_SIZE) {
        const slice = paths.slice(offset, offset + PATHS_INFO_BATCH_SIZE);
        const res = await pathsInfo({
          repo: group.repoId,
          paths: slice,
          revision: group.revision,
          accessToken,
          hubUrl: shared.hubUrl,
          fetch: shared.fetch
        });
        infos.push(...res);
      }
      const infoByPath = new Map(infos.map((i) => [i.path, i]));
      const lfsOffenders = [];
      for (const { index, file } of group.entries) {
        const info = infoByPath.get(file.source.path);
        if (!info) {
          throw new Error(`Source file not found: '${file.source.path}' in ${group.repoId.type}s/${group.repoId.name}`);
        }
        if (info.type !== "file") {
          throw new Error(
            `Source path '${file.source.path}' in ${group.repoId.type}s/${group.repoId.name} is a folder; use copyFolder() instead.`
          );
        }
        switch (classifySourceFile(info)) {
          case "copy":
            operations[index] = {
              operation: "copy",
              path: file.destinationPath,
              sourceXetHash: info.xetHash,
              sourceRepo: group.repoId
            };
            continue;
          case "lfs":
            lfsOffenders.push({ path: file.source.path, size: info.lfs?.size ?? info.size });
            continue;
          case "download":
            pendingDownloads.push({
              index,
              repoId: group.repoId,
              revision: group.revision,
              sourcePath: file.source.path
            });
            operations[index] = {
              operation: "addOrUpdate",
              path: file.destinationPath,
              content: new Blob([])
            };
            continue;
        }
      }
      if (lfsOffenders.length > 0) {
        throwUnmigratedLfsError(group.repoId, lfsOffenders);
      }
    }
    yield* downloadAndFillBlobsIter({
      pendingDownloads,
      operations,
      accessToken,
      hubUrl: shared.hubUrl,
      fetch: shared.fetch
    });
    return operations;
  }
  function downloadAndFillBlobsIter(args) {
    const total = args.pendingDownloads.length;
    return eventToGenerator((yieldCallback, returnCallback, rejectCallback) => {
      if (total === 0) {
        returnCallback();
        return;
      }
      let downloaded = 0;
      promisesQueue(
        args.pendingDownloads.map(({ index, repoId, revision, sourcePath }) => async () => {
          const blob = await downloadFile({
            repo: repoId,
            path: sourcePath,
            revision,
            accessToken: args.accessToken,
            hubUrl: args.hubUrl,
            fetch: args.fetch
          });
          if (!blob) {
            throw new Error(`Failed to download '${sourcePath}' from ${repoId.type}s/${repoId.name}`);
          }
          const op = args.operations[index];
          if (op.operation !== "addOrUpdate") {
            throw new Error("Internal: expected addOrUpdate placeholder operation");
          }
          op.content = blob;
          downloaded++;
          yieldCallback({ event: "fileDownloaded", path: sourcePath, downloaded, total });
        }),
        DOWNLOAD_CONCURRENCY
      ).then(
        () => returnCallback(),
        (err) => rejectCallback(err)
      );
    });
  }
  function relativeUnderFolder(filePath, folderPath) {
    if (!folderPath) {
      return filePath;
    }
    if (filePath === folderPath) {
      return filePath.split("/").pop() ?? filePath;
    }
    if (filePath.startsWith(folderPath + "/")) {
      return filePath.slice(folderPath.length + 1);
    }
    throw new Error(`Path '${filePath}' is not inside folder '${folderPath}'`);
  }
  function classifySourceFile(file) {
    if (file.xetHash) {
      return "copy";
    }
    if (file.lfs) {
      return "lfs";
    }
    return "download";
  }
  function throwUnmigratedLfsError(repoId, entries) {
    const head = entries.slice(0, MAX_REPORTED_LFS_PATHS).map((e) => `'${e.path}' (${formatBytes(e.size)})`).join(", ");
    const more = entries.length > MAX_REPORTED_LFS_PATHS ? ` (and ${entries.length - MAX_REPORTED_LFS_PATHS} more)` : "";
    throw new Error(
      `Cannot copy ${entries.length} LFS file(s) from ${repoId.type}s/${repoId.name} that have not been migrated to xet: ${head}${more}. Migrate these files to xet before copying.`
    );
  }
  async function countCommits(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const url = `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/commits/${params.revision ?? "main"}?limit=1`;
    const res = await (params.fetch ?? fetch)(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    });
    if (!res.ok) {
      throw await createApiError(res);
    }
    return parseInt(res.headers.get("x-total-count") ?? "0", 10);
  }
  async function createRepo(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const [namespace, repoName] = repoId.name.split("/");
    const visibility = params.visibility ?? (params.private !== void 0 ? params.private ? "private" : "public" : void 0);
    if (!namespace || !repoName) {
      throw new TypeError(
        `"${repoId.name}" is not a fully qualified repo name. It should be of the form "{namespace}/{repoName}".`
      );
    }
    const res = repoId.type === "bucket" ? await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/buckets/${namespace}/${repoName}`, {
      method: "POST",
      body: JSON.stringify({
        visibility,
        resourceGroupId: params.resourceGroupId
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }) : await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/repos/create`, {
      method: "POST",
      body: JSON.stringify({
        name: repoName,
        visibility,
        organization: namespace,
        resourceGroupId: params.resourceGroupId,
        license: params.license,
        ...repoId.type === "space" ? {
          type: "space",
          sdk: params.sdk ?? "static"
        } : {
          type: repoId.type
        },
        files: params.files ? await Promise.all(
          params.files.map(async (file) => ({
            encoding: "base64",
            path: file.path,
            content: base64FromBytes(
              new Uint8Array(file.content instanceof Blob ? await file.content.arrayBuffer() : file.content)
            )
          }))
        ) : void 0
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      throw await createApiError(res);
    }
    const output = await res.json();
    return { repoUrl: output.url, id: output.id };
  }
  async function createBranch(params) {
    const repoId = toRepoId(params.repo);
    const res = await (params.fetch ?? fetch)(
      `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/branch/${encodeURIComponent(params.branch)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...params.accessToken && {
            Authorization: `Bearer ${params.accessToken}`
          }
        },
        body: JSON.stringify({
          startingPoint: params.revision,
          ...params.empty && { emptyBranch: true },
          overwrite: params.overwrite
        })
      }
    );
    if (!res.ok) {
      throw await createApiError(res);
    }
  }
  async function createCollection(params) {
    const accessToken = checkCredentials(params);
    const res = await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/collections`, {
      method: "POST",
      body: JSON.stringify(params.collection),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      throw await createApiError(res);
    }
    const output = await res.json();
    return { slug: output.slug };
  }
  function pick(o, props) {
    return Object.assign(
      {},
      ...props.map((prop) => {
        if (o[prop] !== void 0) {
          return { [prop]: o[prop] };
        }
      })
    );
  }
  var DATASET_EXPAND_KEYS = [
    "private",
    "downloads",
    "gated",
    "likes",
    "lastModified"
  ];
  var DATASET_EXPANDABLE_KEYS = [
    "author",
    "cardData",
    "citation",
    "createdAt",
    "disabled",
    "description",
    "downloads",
    "downloadsAllTime",
    "gated",
    "gitalyUid",
    "lastModified",
    "likes",
    "paperswithcode_id",
    "private",
    // "siblings",
    "sha",
    "tags"
  ];
  async function* listDatasets(params) {
    const accessToken = params && checkCredentials(params);
    let totalToFetch = params?.limit ?? Infinity;
    const search = new URLSearchParams([
      ...Object.entries({
        limit: String(Math.min(totalToFetch, 500)),
        ...params?.search?.owner ? { author: params.search.owner } : void 0,
        ...params?.search?.query ? { search: params.search.query } : void 0,
        ...params?.sort ? { sort: params.sort } : void 0
      }),
      ...params?.search?.tags?.map((tag) => ["filter", tag]) ?? [],
      ...DATASET_EXPAND_KEYS.map((val) => ["expand", val]),
      ...params?.additionalFields?.map((val) => ["expand", val]) ?? []
    ]).toString();
    let url = `${params?.hubUrl || HUB_URL}/api/datasets` + (search ? "?" + search : "");
    while (url) {
      const res = await (params?.fetch ?? fetch)(url, {
        headers: {
          accept: "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : void 0
        }
      });
      if (!res.ok) {
        throw await createApiError(res);
      }
      const items = await res.json();
      for (const item of items) {
        yield {
          ...params?.additionalFields && pick(item, params.additionalFields),
          id: item._id,
          name: item.id,
          private: item.private,
          downloads: item.downloads,
          likes: item.likes,
          gated: item.gated,
          updatedAt: new Date(item.lastModified)
        };
        totalToFetch--;
        if (totalToFetch <= 0) {
          return;
        }
      }
      const linkHeader = res.headers.get("Link");
      url = linkHeader ? parseLinkHeader(linkHeader).next : void 0;
    }
  }
  async function datasetInfo(params) {
    const accessToken = params && checkCredentials(params);
    const search = new URLSearchParams([
      ...DATASET_EXPAND_KEYS.map((val) => ["expand", val]),
      ...params?.additionalFields?.map((val) => ["expand", val]) ?? []
    ]).toString();
    const response = await (params.fetch || fetch)(
      `${params?.hubUrl || HUB_URL}/api/datasets/${params.name}/revision/${encodeURIComponent(
        params.revision ?? "HEAD"
      )}?${search.toString()}`,
      {
        headers: {
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    const data = await response.json();
    return {
      ...params?.additionalFields && pick(data, params.additionalFields),
      id: data._id,
      name: data.id,
      private: data.private,
      downloads: data.downloads,
      likes: data.likes,
      gated: data.gated,
      updatedAt: new Date(data.lastModified)
    };
  }
  async function deleteBranch(params) {
    const repoId = toRepoId(params.repo);
    const res = await (params.fetch ?? fetch)(
      `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/branch/${encodeURIComponent(params.branch)}`,
      {
        method: "DELETE",
        headers: {
          ...params.accessToken && {
            Authorization: `Bearer ${params.accessToken}`
          }
        }
      }
    );
    if (!res.ok) {
      throw await createApiError(res);
    }
  }
  function deleteFile(params) {
    return commit({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      repo: params.repo,
      operations: [
        {
          operation: "delete",
          path: params.path
        }
      ],
      title: params.commitTitle ?? `Delete ${params.path}`,
      description: params.commitDescription,
      hubUrl: params.hubUrl,
      branch: params.branch,
      isPullRequest: params.isPullRequest,
      parentCommit: params.parentCommit,
      fetch: params.fetch
    });
  }
  function deleteFiles(params) {
    return commit({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      repo: params.repo,
      operations: params.paths.map((path) => ({
        operation: "delete",
        path
      })),
      title: params.commitTitle ?? `Deletes ${params.paths.length} files`,
      description: params.commitDescription,
      hubUrl: params.hubUrl,
      branch: params.branch,
      isPullRequest: params.isPullRequest,
      parentCommit: params.parentCommit,
      fetch: params.fetch
    });
  }
  async function deleteRepo(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const [namespace, repoName] = repoId.name.split("/");
    const res = repoId.type === "bucket" ? await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/buckets/${namespace}/${repoName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }) : await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/repos/delete`, {
      method: "DELETE",
      body: JSON.stringify({
        name: repoName,
        organization: namespace,
        type: repoId.type
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      throw await createApiError(res);
    }
  }
  async function deleteCollection(params) {
    if (!params.slug) {
      throw new TypeError("slug is required");
    }
    const accessToken = checkCredentials(params);
    const res = await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/collections/${params.slug}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      throw await createApiError(res);
    }
  }
  async function fileExists(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    const hubUrl = params.hubUrl ?? HUB_URL;
    const revision = repoId.type === "bucket" ? void 0 : params.revision ?? "main";
    const endpoint = repoId.type === "bucket" ? "resolve" : "raw";
    const url = `${hubUrl}/${repoId.type === "model" ? "" : `${repoId.type}s/`}${repoId.name}/${endpoint}${revision ? `/${encodeURIComponent(revision)}` : ""}/${params.path}`;
    const resp = await (params.fetch ?? fetch)(url, {
      method: "HEAD",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    });
    if (resp.status === 404) {
      return false;
    }
    if (!resp.ok) {
      throw await createApiError(resp);
    }
    return true;
  }
  async function cancelJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}/${params.jobId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function createScheduledJob(params) {
    const accessToken = checkCredentials(params);
    const { namespace, hubUrl, fetch: customFetch, ...rest } = params;
    if (!rest.jobSpec.dockerImage && !rest.jobSpec.spaceId) {
      throw new Error("Either dockerImage or spaceId must be provided in jobSpec");
    }
    if (rest.jobSpec.dockerImage && rest.jobSpec.spaceId) {
      throw new Error("Cannot provide both dockerImage and spaceId in jobSpec");
    }
    const body = {
      jobSpec: {
        flavor: rest.jobSpec.flavor
      },
      schedule: rest.schedule,
      suspend: rest.suspend ?? false,
      concurrency: rest.concurrency ?? false
    };
    if (rest.jobSpec.dockerImage) {
      body.jobSpec.dockerImage = rest.jobSpec.dockerImage;
    }
    if (rest.jobSpec.spaceId) {
      body.jobSpec.spaceId = rest.jobSpec.spaceId;
    }
    if (rest.jobSpec.command) {
      body.jobSpec.command = rest.jobSpec.command;
    }
    body.jobSpec.environment = rest.jobSpec.environment || {};
    if (rest.jobSpec.secrets) {
      body.jobSpec.secrets = rest.jobSpec.secrets;
    }
    if (rest.jobSpec.arch) {
      body.jobSpec.arch = rest.jobSpec.arch;
    }
    if (rest.jobSpec.timeoutSeconds !== void 0) {
      body.jobSpec.timeoutSeconds = rest.jobSpec.timeoutSeconds;
    }
    if (rest.jobSpec.attempts !== void 0) {
      body.jobSpec.attempts = rest.jobSpec.attempts;
    }
    if (rest.jobSpec.labels) {
      body.jobSpec.labels = rest.jobSpec.labels;
    }
    if (rest.jobSpec.volumes?.length) {
      body.jobSpec.volumes = rest.jobSpec.volumes.map(({ source, ...rest2 }) => {
        const repoId = toRepoId(source);
        return { type: repoId.type, source: repoId.name, ...rest2 };
      });
    }
    const response = await (customFetch || fetch)(`${hubUrl || HUB_URL}/api/scheduled-jobs/${namespace}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function deleteScheduledJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/scheduled-jobs/${params.namespace}/${params.jobId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
  }
  async function duplicateJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}/${params.jobId}/duplicate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function getJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}/${params.jobId}`,
      {
        headers: {
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function getScheduledJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/scheduled-jobs/${params.namespace}/${params.jobId}`,
      {
        headers: {
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function listJobHardware(params) {
    const accessToken = checkCredentials(params ?? {});
    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const response = await (params?.fetch || fetch)(`${params?.hubUrl || HUB_URL}/api/jobs/hardware`, {
      headers
    });
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function listJobs(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(`${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}`, {
      headers: {
        ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      }
    });
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function listScheduledJobs(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(`${params.hubUrl || HUB_URL}/api/scheduled-jobs/${params.namespace}`, {
      headers: {
        ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      }
    });
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function resumeScheduledJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/scheduled-jobs/${params.namespace}/${params.jobId}/resume`,
      {
        method: "POST",
        headers: {
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
  }
  async function runJob(params) {
    const accessToken = checkCredentials(params);
    if (!params.dockerImage && !params.spaceId) {
      throw new Error("Either dockerImage or spaceId must be provided");
    }
    if (params.dockerImage && params.spaceId) {
      throw new Error("Cannot provide both dockerImage and spaceId");
    }
    const body = {
      flavor: params.flavor,
      environment: params.environment || {}
    };
    if (params.dockerImage) {
      body.dockerImage = params.dockerImage;
    }
    if (params.spaceId) {
      body.spaceId = params.spaceId;
    }
    if (params.command) {
      body.command = params.command;
    }
    if (params.arguments) {
      body.arguments = params.arguments;
    }
    if (params.secrets) {
      body.secrets = params.secrets;
    }
    if (params.arch) {
      body.arch = params.arch;
    }
    if (params.timeoutSeconds !== void 0) {
      body.timeoutSeconds = params.timeoutSeconds;
    }
    if (params.attempts !== void 0) {
      body.attempts = params.attempts;
    }
    if (params.labels) {
      body.labels = params.labels;
    }
    if (params.volumes?.length) {
      body.volumes = params.volumes.map(({ source, ...rest }) => {
        const repoId = toRepoId(source);
        return { type: repoId.type, source: repoId.name, ...rest };
      });
    }
    const response = await (params.fetch || fetch)(`${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function runScheduledJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/scheduled-jobs/${params.namespace}/${params.jobId}/run`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      if (response.status === 409) {
        return null;
      }
      throw await createApiError(response);
    }
    return await response.json();
  }
  async function* streamJobEvents(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}/${params.jobId}/events`,
      {
        headers: {
          Accept: "text/event-stream",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    if (!response.body) {
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            yield line.slice(6);
          }
        }
      }
      if (buffer) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            yield line.slice(6);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  async function* streamJobLogs(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}/${params.jobId}/logs`,
      {
        headers: {
          Accept: "text/event-stream",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    if (!response.body) {
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              yield { message: data.data, timestamp: new Date(data.timestamp) };
            } catch {
              yield { message: line.slice(6), timestamp: /* @__PURE__ */ new Date() };
            }
          }
        }
      }
      if (buffer) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              yield { message: data.data, timestamp: new Date(data.timestamp) };
            } catch {
              yield { message: line.slice(6), timestamp: /* @__PURE__ */ new Date() };
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  async function* streamJobMetrics(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/jobs/${params.namespace}/${params.jobId}/metrics`,
      {
        headers: {
          Accept: "text/event-stream",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    if (!response.body) {
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            yield line.slice(6);
          }
        }
      }
      if (buffer) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            yield line.slice(6);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  async function suspendScheduledJob(params) {
    const accessToken = checkCredentials(params);
    const response = await (params.fetch || fetch)(
      `${params.hubUrl || HUB_URL}/api/scheduled-jobs/${params.namespace}/${params.jobId}/suspend`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
  }
  async function* listCommits(params) {
    const accessToken = checkCredentials(params);
    const repoId = toRepoId(params.repo);
    let url = `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}/commits/${params.revision ?? "main"}?limit=${params.batchSize ?? 100}`;
    while (url) {
      const res = await (params.fetch ?? fetch)(url, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      });
      if (!res.ok) {
        throw await createApiError(res);
      }
      const resJson = await res.json();
      for (const commit2 of resJson) {
        yield {
          oid: commit2.id,
          title: commit2.title,
          message: commit2.message,
          authors: commit2.authors.map((author) => ({
            username: author.user,
            avatarUrl: author.avatar
          })),
          date: new Date(commit2.date)
        };
      }
      const linkHeader = res.headers.get("Link");
      url = linkHeader ? parseLinkHeader(linkHeader).next : void 0;
    }
  }
  function normalizeInferenceProviderMapping(hfModelId, inferenceProviderMapping) {
    if (!inferenceProviderMapping) {
      return [];
    }
    if (Array.isArray(inferenceProviderMapping)) {
      return inferenceProviderMapping.map((entry) => ({
        ...entry,
        hfModelId
      }));
    }
    return Object.entries(inferenceProviderMapping).map(([provider, mapping]) => ({
      provider,
      hfModelId,
      providerId: mapping.providerId,
      status: mapping.status,
      task: mapping.task
    }));
  }
  var MODEL_EXPAND_KEYS = [
    "pipeline_tag",
    "private",
    "gated",
    "downloads",
    "likes",
    "lastModified"
  ];
  var MODEL_EXPANDABLE_KEYS = [
    "author",
    "cardData",
    "config",
    "createdAt",
    "disabled",
    "downloads",
    "downloadsAllTime",
    "gated",
    "gitalyUid",
    "inferenceProviderMapping",
    "lastModified",
    "library_name",
    "likes",
    "model-index",
    "pipeline_tag",
    "private",
    "safetensors",
    "sha",
    "spaces",
    "tags",
    "transformersInfo"
  ];
  var MODEL_DERIVED_FIELD_TO_API_KEY = {
    filePaths: "siblings"
  };
  async function* listModels(params) {
    const accessToken = params && checkCredentials(params);
    let totalToFetch = params?.limit ?? Infinity;
    const additionalExpandKeys = params?.additionalFields?.map(
      (field) => MODEL_DERIVED_FIELD_TO_API_KEY[field] ?? field
    ) ?? [];
    const search = new URLSearchParams([
      ...Object.entries({
        limit: String(Math.min(totalToFetch, 500)),
        ...params?.search?.owner ? { author: params.search.owner } : void 0,
        ...params?.search?.task ? { pipeline_tag: params.search.task } : void 0,
        ...params?.search?.query ? { search: params.search.query } : void 0,
        ...params?.search?.inferenceProviders ? { inference_provider: params.search.inferenceProviders.join(",") } : void 0,
        ...params?.search?.apps ? { apps: params.search.apps.join(",") } : void 0,
        ...params?.sort ? { sort: params.sort } : void 0
      }),
      ...params?.search?.tags?.map((tag) => ["filter", tag]) ?? [],
      ...MODEL_EXPAND_KEYS.map((val) => ["expand", val]),
      ...additionalExpandKeys.map((val) => ["expand", val])
    ]).toString();
    let url = `${params?.hubUrl || HUB_URL}/api/models?${search}`;
    while (url) {
      const res = await (params?.fetch ?? fetch)(url, {
        headers: {
          accept: "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : void 0
        }
      });
      if (!res.ok) {
        throw await createApiError(res);
      }
      const items = await res.json();
      for (const item of items) {
        const additional = {};
        if (params?.additionalFields) {
          for (const field of params.additionalFields) {
            if (field === "filePaths") {
              additional.filePaths = (item.siblings ?? []).map((s) => s.rfilename);
            } else if (field === "inferenceProviderMapping" && item.inferenceProviderMapping) {
              additional.inferenceProviderMapping = normalizeInferenceProviderMapping(
                item.id,
                item.inferenceProviderMapping
              );
            } else {
              additional[field] = item[field];
            }
          }
        }
        yield {
          ...additional,
          id: item._id,
          name: item.id,
          private: item.private,
          task: item.pipeline_tag,
          downloads: item.downloads,
          gated: item.gated,
          likes: item.likes,
          updatedAt: new Date(item.lastModified)
        };
        totalToFetch--;
        if (totalToFetch <= 0) {
          return;
        }
      }
      const linkHeader = res.headers.get("Link");
      url = linkHeader ? parseLinkHeader(linkHeader).next : void 0;
    }
  }
  var SPACE_EXPAND_KEYS = [
    "sdk",
    "likes",
    "private",
    "lastModified"
  ];
  var SPACE_EXPANDABLE_KEYS = [
    "author",
    "cardData",
    "datasets",
    "disabled",
    "gitalyUid",
    "lastModified",
    "createdAt",
    "likes",
    "private",
    "runtime",
    "sdk",
    // "siblings",
    "sha",
    "subdomain",
    "tags",
    "models"
  ];
  async function* listSpaces(params) {
    const accessToken = params && checkCredentials(params);
    const search = new URLSearchParams([
      ...Object.entries({
        limit: "500",
        ...params?.search?.owner ? { author: params.search.owner } : void 0,
        ...params?.search?.query ? { search: params.search.query } : void 0,
        ...params?.sort ? { sort: params.sort } : void 0
      }),
      ...params?.search?.tags?.map((tag) => ["filter", tag]) ?? [],
      ...[...SPACE_EXPAND_KEYS, ...params?.additionalFields ?? []].map(
        (val) => ["expand", val]
      )
    ]).toString();
    let url = `${params?.hubUrl || HUB_URL}/api/spaces?${search}`;
    while (url) {
      const res = await (params?.fetch ?? fetch)(url, {
        headers: {
          accept: "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : void 0
        }
      });
      if (!res.ok) {
        throw await createApiError(res);
      }
      const items = await res.json();
      for (const item of items) {
        yield {
          ...params?.additionalFields && pick(item, params.additionalFields),
          id: item._id,
          name: item.id,
          sdk: item.sdk,
          likes: item.likes,
          private: item.private,
          updatedAt: new Date(item.lastModified)
        };
      }
      const linkHeader = res.headers.get("Link");
      url = linkHeader ? parseLinkHeader(linkHeader).next : void 0;
    }
  }
  async function* listCollections(params) {
    const accessToken = params && checkCredentials(params);
    const searchParams = new URLSearchParams();
    let totalToFetch = params?.limit ?? Infinity;
    searchParams.append("limit", String(Math.min(totalToFetch, 100)));
    if (params?.sort) {
      searchParams.append("sort", params.sort);
    }
    if (params?.search?.owner) {
      for (const owner of params.search.owner) {
        searchParams.append("owner", owner);
      }
    }
    if (params?.search?.item) {
      for (const item of params.search.item) {
        searchParams.append("item", item);
      }
    }
    if (params?.search?.q) {
      searchParams.append("q", params.search.q);
    }
    let url = `${params?.hubUrl || HUB_URL}/api/collections?${searchParams}`;
    while (url) {
      const res = await (params?.fetch ?? fetch)(url, {
        headers: {
          accept: "application/json",
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : void 0
        }
      });
      if (!res.ok) {
        throw await createApiError(res);
      }
      const collections = await res.json();
      for (const collection of collections) {
        yield collection;
        totalToFetch--;
        if (totalToFetch <= 0) {
          return;
        }
      }
      const linkHeader = res.headers.get("Link");
      url = linkHeader ? parseLinkHeader(linkHeader).next : void 0;
    }
  }
  async function modelInfo(params) {
    const accessToken = params && checkCredentials(params);
    const additionalExpandKeys = params?.additionalFields?.map(
      (field) => MODEL_DERIVED_FIELD_TO_API_KEY[field] ?? field
    ) ?? [];
    const search = new URLSearchParams([
      ...MODEL_EXPAND_KEYS.map((val) => ["expand", val]),
      ...additionalExpandKeys.map((val) => ["expand", val])
    ]).toString();
    const response = await (params.fetch || fetch)(
      `${params?.hubUrl || HUB_URL}/api/models/${params.name}/revision/${encodeURIComponent(
        params.revision ?? "HEAD"
      )}?${search.toString()}`,
      {
        headers: {
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    const data = await response.json();
    const additional = {};
    if (params?.additionalFields) {
      for (const field of params.additionalFields) {
        if (field === "filePaths") {
          additional.filePaths = (data.siblings ?? []).map((s) => s.rfilename);
        } else if (field === "inferenceProviderMapping" && data.inferenceProviderMapping) {
          additional.inferenceProviderMapping = normalizeInferenceProviderMapping(data.id, data.inferenceProviderMapping);
        } else {
          additional[field] = data[field];
        }
      }
    }
    return {
      ...additional,
      id: data._id,
      name: data.id,
      private: data.private,
      task: data.pipeline_tag,
      downloads: data.downloads,
      gated: data.gated,
      likes: data.likes,
      updatedAt: new Date(data.lastModified)
    };
  }
  async function oauthHandleRedirect(opts) {
    if (typeof window === "undefined" && !opts?.redirectedUrl) {
      throw new Error("oauthHandleRedirect is only available in the browser, unless you provide redirectedUrl");
    }
    if (typeof localStorage === "undefined" && (!opts?.nonce || !opts?.codeVerifier)) {
      throw new Error(
        "oauthHandleRedirect requires localStorage to be available, unless you provide nonce and codeVerifier"
      );
    }
    const redirectedUrl = opts?.redirectedUrl ?? window.location.href;
    const searchParams = (() => {
      try {
        return new URL(redirectedUrl).searchParams;
      } catch (err) {
        throw new Error("Failed to parse redirected URL: " + redirectedUrl);
      }
    })();
    const [error, errorDescription] = [searchParams.get("error"), searchParams.get("error_description")];
    if (error) {
      throw new Error(`${error}: ${errorDescription}`);
    }
    const code = searchParams.get("code");
    const nonce = opts?.nonce ?? localStorage.getItem("huggingface.co:oauth:nonce");
    if (!code) {
      throw new Error("Missing oauth code from query parameters in redirected URL: " + redirectedUrl);
    }
    if (!nonce) {
      throw new Error("Missing oauth nonce from localStorage");
    }
    const codeVerifier = opts?.codeVerifier ?? localStorage.getItem("huggingface.co:oauth:code_verifier");
    if (!codeVerifier) {
      throw new Error("Missing oauth code_verifier from localStorage");
    }
    const state = searchParams.get("state");
    if (!state) {
      throw new Error("Missing oauth state from query parameters in redirected URL");
    }
    let parsedState;
    try {
      parsedState = JSON.parse(state);
    } catch {
      throw new Error("Invalid oauth state in redirected URL, unable to parse JSON: " + state);
    }
    if (parsedState.nonce !== nonce) {
      throw new Error("Invalid oauth state in redirected URL");
    }
    const hubUrl = opts?.hubUrl || HUB_URL;
    const openidConfigUrl = `${new URL(hubUrl).origin}/.well-known/openid-configuration`;
    const openidConfigRes = await fetch(openidConfigUrl, {
      headers: {
        Accept: "application/json"
      }
    });
    if (!openidConfigRes.ok) {
      throw await createApiError(openidConfigRes);
    }
    const openidConfig = await openidConfigRes.json();
    const tokenRes = await fetch(openidConfig.token_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: parsedState.redirectUri,
        code_verifier: codeVerifier
      }).toString()
    });
    if (!opts?.codeVerifier) {
      localStorage.removeItem("huggingface.co:oauth:code_verifier");
    }
    if (!opts?.nonce) {
      localStorage.removeItem("huggingface.co:oauth:nonce");
    }
    if (!tokenRes.ok) {
      throw await createApiError(tokenRes);
    }
    const token = await tokenRes.json();
    const accessTokenExpiresAt = new Date(Date.now() + token.expires_in * 1e3);
    const userInfoRes = await fetch(openidConfig.userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });
    if (!userInfoRes.ok) {
      throw await createApiError(userInfoRes);
    }
    const userInfo = await userInfoRes.json();
    return {
      accessToken: token.access_token,
      accessTokenExpiresAt,
      userInfo,
      state: parsedState.state,
      scope: token.scope
    };
  }
  async function oauthHandleRedirectIfPresent(opts) {
    if (typeof window === "undefined" && !opts?.redirectedUrl) {
      throw new Error("oauthHandleRedirect is only available in the browser, unless you provide redirectedUrl");
    }
    if (typeof localStorage === "undefined" && (!opts?.nonce || !opts?.codeVerifier)) {
      throw new Error(
        "oauthHandleRedirect requires localStorage to be available, unless you provide nonce and codeVerifier"
      );
    }
    const searchParams = new URLSearchParams(opts?.redirectedUrl ?? window.location.search);
    if (searchParams.has("error")) {
      return oauthHandleRedirect(opts);
    }
    if (searchParams.has("code")) {
      if (!localStorage.getItem("huggingface.co:oauth:nonce")) {
        console.warn(
          "Missing oauth nonce from localStorage. This can happen when the user refreshes the page after logging in, without changing the URL."
        );
        return false;
      }
      return oauthHandleRedirect(opts);
    }
    return false;
  }
  async function oauthLoginUrl(opts) {
    if (typeof window === "undefined" && (!opts?.redirectUrl || !opts?.clientId)) {
      throw new Error("oauthLogin is only available in the browser, unless you provide clientId and redirectUrl");
    }
    if (typeof localStorage === "undefined" && !opts?.localStorage) {
      throw new Error(
        "oauthLogin requires localStorage to be available in the context, unless you provide a localStorage empty object as argument"
      );
    }
    const hubUrl = opts?.hubUrl || HUB_URL;
    const openidConfigUrl = `${new URL(hubUrl).origin}/.well-known/openid-configuration`;
    const openidConfigRes = await fetch(openidConfigUrl, {
      headers: {
        Accept: "application/json"
      }
    });
    if (!openidConfigRes.ok) {
      throw await createApiError(openidConfigRes);
    }
    const opendidConfig = await openidConfigRes.json();
    const newNonce = globalThis.crypto.randomUUID();
    const newCodeVerifier = globalThis.crypto.randomUUID() + globalThis.crypto.randomUUID();
    if (opts?.localStorage) {
      if (opts.localStorage.codeVerifier !== void 0 && opts.localStorage.codeVerifier !== null) {
        throw new Error(
          "localStorage.codeVerifier must be initially set to null or undefined, and will be filled by oauthLoginUrl"
        );
      }
      if (opts.localStorage.nonce !== void 0 && opts.localStorage.nonce !== null) {
        throw new Error(
          "localStorage.nonce must be initially set to null or undefined, and will be filled by oauthLoginUrl"
        );
      }
      opts.localStorage.codeVerifier = newCodeVerifier;
      opts.localStorage.nonce = newNonce;
    } else {
      localStorage.setItem("huggingface.co:oauth:nonce", newNonce);
      localStorage.setItem("huggingface.co:oauth:code_verifier", newCodeVerifier);
    }
    const redirectUri = opts?.redirectUrl || (typeof window !== "undefined" ? window.location.href : void 0);
    if (!redirectUri) {
      throw new Error("Missing redirectUrl");
    }
    const state = JSON.stringify({
      nonce: newNonce,
      redirectUri,
      state: opts?.state
    });
    const variables = (
      // @ts-expect-error window.huggingface is defined inside static Spaces.
      typeof window !== "undefined" ? window.huggingface?.variables ?? null : null
    );
    const clientId = opts?.clientId || variables?.OAUTH_CLIENT_ID;
    if (!clientId) {
      if (variables) {
        throw new Error("Missing clientId, please add hf_oauth: true to the README.md's metadata in your static Space");
      }
      throw new Error("Missing clientId");
    }
    const challenge = base64FromBytes(
      new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(newCodeVerifier)))
    ).replace(/[+]/g, "-").replace(/[/]/g, "_").replace(/=/g, "");
    return `${opendidConfig.authorization_endpoint}?${new URLSearchParams({
      client_id: clientId,
      scope: opts?.scopes || variables?.OAUTH_SCOPES || "openid profile",
      response_type: "code",
      redirect_uri: redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    }).toString()}`;
  }
  function typedInclude(arr, v) {
    return arr.includes(v);
  }
  function omit(o, props) {
    const propsArr = Array.isArray(props) ? props : [props];
    const letsKeep = Object.keys(o).filter((prop) => !typedInclude(propsArr, prop));
    return pick(o, letsKeep);
  }
  function typedEntries(obj) {
    return Object.entries(obj);
  }
  var JsonStreamParseError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "JsonStreamParseError";
    }
  };
  var DEFAULT_MAX_TOKEN_LENGTH = 16e6;
  var DEFAULT_MAX_DEPTH = 1e3;
  var S_VALUE = 0;
  var S_VALUE_OR_ARRAY_END = 1;
  var S_STRING = 2;
  var S_STRING_ESCAPE = 3;
  var S_STRING_UNICODE = 4;
  var S_NUMBER = 5;
  var S_LITERAL = 6;
  var S_AFTER_VALUE = 7;
  var S_KEY = 8;
  var S_KEY_OR_OBJECT_END = 9;
  var S_AFTER_KEY = 10;
  var S_DONE = 11;
  var ESCAPES = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "	"
  };
  function isWhitespace(c) {
    return c === " " || c === "\n" || c === "\r" || c === "	";
  }
  function isNumberChar(c) {
    return c >= "0" && c <= "9" || c === "-" || c === "+" || c === "." || c === "e" || c === "E";
  }
  function isHexDigit(c) {
    return c >= "0" && c <= "9" || c >= "a" && c <= "f" || c >= "A" && c <= "F";
  }
  async function* toByteChunks(source) {
    if (!("getReader" in source)) {
      yield* source;
      return;
    }
    const reader = source.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        if (value) {
          yield value;
        }
      }
    } finally {
      await reader.cancel().catch(() => void 0);
    }
  }
  async function* streamJson(source, options) {
    const maxTokenLength = options?.maxTokenLength ?? DEFAULT_MAX_TOKEN_LENGTH;
    const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
    let state = S_VALUE;
    const stack = [];
    let token = "";
    let stringIsKey = false;
    let unicode = "";
    function checkTokenLength() {
      if (token.length > maxTokenLength) {
        throw new JsonStreamParseError(`JSON token exceeds the maximum length of ${maxTokenLength} characters`);
      }
    }
    function afterValue() {
      state = stack.length === 0 ? S_DONE : S_AFTER_VALUE;
    }
    function finishNumber() {
      const value = Number(token);
      if (token === "" || !Number.isFinite(value)) {
        throw new JsonStreamParseError(`Invalid JSON number: ${JSON.stringify(token)}`);
      }
      token = "";
      afterValue();
      return { type: "value", value };
    }
    function finishLiteral() {
      const text = token;
      token = "";
      afterValue();
      switch (text) {
        case "true":
          return { type: "value", value: true };
        case "false":
          return { type: "value", value: false };
        case "null":
          return { type: "value", value: null };
        default:
          throw new JsonStreamParseError(`Invalid JSON literal: ${JSON.stringify(text)}`);
      }
    }
    function unexpected(c) {
      throw new JsonStreamParseError(`Unexpected character ${JSON.stringify(c)} in JSON`);
    }
    function pushContainer(isArray) {
      if (stack.length >= maxDepth) {
        throw new JsonStreamParseError(`JSON nesting is deeper than the maximum of ${maxDepth} levels`);
      }
      stack.push(isArray);
    }
    function* feed(chunk2) {
      let i = 0;
      while (i < chunk2.length) {
        if (state === S_STRING) {
          let j = i;
          while (j < chunk2.length && chunk2[j] !== '"' && chunk2[j] !== "\\") {
            j++;
          }
          if (j > i) {
            token += chunk2.slice(i, j);
            checkTokenLength();
            i = j;
            continue;
          }
          if (chunk2[i] === "\\") {
            state = S_STRING_ESCAPE;
            i++;
            continue;
          }
          i++;
          const text = token;
          token = "";
          if (stringIsKey) {
            stringIsKey = false;
            state = S_AFTER_KEY;
            yield { type: "key", key: text };
          } else {
            afterValue();
            yield { type: "value", value: text };
          }
          continue;
        }
        if (state === S_STRING_ESCAPE) {
          const c2 = chunk2[i++];
          if (c2 === "u") {
            unicode = "";
            state = S_STRING_UNICODE;
            continue;
          }
          const escaped = ESCAPES[c2];
          if (escaped === void 0) {
            throw new JsonStreamParseError(`Invalid escape sequence "\\${c2}" in JSON string`);
          }
          token += escaped;
          checkTokenLength();
          state = S_STRING;
          continue;
        }
        if (state === S_STRING_UNICODE) {
          const c2 = chunk2[i++];
          if (!isHexDigit(c2)) {
            throw new JsonStreamParseError(`Invalid unicode escape "\\u${unicode}${c2}" in JSON string`);
          }
          unicode += c2;
          if (unicode.length === 4) {
            token += String.fromCharCode(parseInt(unicode, 16));
            checkTokenLength();
            unicode = "";
            state = S_STRING;
          }
          continue;
        }
        if (state === S_NUMBER) {
          let j = i;
          while (j < chunk2.length && isNumberChar(chunk2[j])) {
            j++;
          }
          if (j > i) {
            token += chunk2.slice(i, j);
            checkTokenLength();
            i = j;
            continue;
          }
          yield finishNumber();
          continue;
        }
        if (state === S_LITERAL) {
          let j = i;
          while (j < chunk2.length && chunk2[j] >= "a" && chunk2[j] <= "z") {
            j++;
          }
          if (j > i) {
            token += chunk2.slice(i, j);
            checkTokenLength();
            i = j;
            continue;
          }
          yield finishLiteral();
          continue;
        }
        const c = chunk2[i];
        if (isWhitespace(c)) {
          i++;
          continue;
        }
        switch (state) {
          case S_VALUE:
          case S_VALUE_OR_ARRAY_END: {
            if (c === "]") {
              if (state !== S_VALUE_OR_ARRAY_END) {
                unexpected(c);
              }
              stack.pop();
              afterValue();
              i++;
              yield { type: "endArray" };
              break;
            }
            if (c === "{") {
              pushContainer(false);
              state = S_KEY_OR_OBJECT_END;
              i++;
              yield { type: "startObject" };
              break;
            }
            if (c === "[") {
              pushContainer(true);
              state = S_VALUE_OR_ARRAY_END;
              i++;
              yield { type: "startArray" };
              break;
            }
            if (c === '"') {
              stringIsKey = false;
              state = S_STRING;
              i++;
              break;
            }
            if (c === "-" || c >= "0" && c <= "9") {
              state = S_NUMBER;
              break;
            }
            if (c >= "a" && c <= "z") {
              state = S_LITERAL;
              break;
            }
            unexpected(c);
            break;
          }
          case S_KEY:
          case S_KEY_OR_OBJECT_END: {
            if (c === "}") {
              if (state !== S_KEY_OR_OBJECT_END) {
                unexpected(c);
              }
              stack.pop();
              afterValue();
              i++;
              yield { type: "endObject" };
              break;
            }
            if (c === '"') {
              stringIsKey = true;
              state = S_STRING;
              i++;
              break;
            }
            unexpected(c);
            break;
          }
          case S_AFTER_KEY: {
            if (c !== ":") {
              unexpected(c);
            }
            state = S_VALUE;
            i++;
            break;
          }
          case S_AFTER_VALUE: {
            if (c === ",") {
              state = stack[stack.length - 1] ? S_VALUE : S_KEY;
              i++;
              break;
            }
            if (c === "}") {
              if (stack[stack.length - 1] !== false) {
                unexpected(c);
              }
              stack.pop();
              afterValue();
              i++;
              yield { type: "endObject" };
              break;
            }
            if (c === "]") {
              if (stack[stack.length - 1] !== true) {
                unexpected(c);
              }
              stack.pop();
              afterValue();
              i++;
              yield { type: "endArray" };
              break;
            }
            unexpected(c);
            break;
          }
          case S_DONE:
            throw new JsonStreamParseError(`Unexpected trailing content ${JSON.stringify(c)} after JSON value`);
          default:
            throw new JsonStreamParseError(`Unreachable parser state ${state}`);
        }
      }
    }
    const decoder = new TextDecoder("utf-8");
    for await (const bytes of toByteChunks(source)) {
      const chunk2 = decoder.decode(bytes, { stream: true });
      if (chunk2.length > 0) {
        yield* feed(chunk2);
      }
    }
    const tail = decoder.decode();
    if (tail.length > 0) {
      yield* feed(tail);
    }
    if (state === S_NUMBER) {
      yield finishNumber();
    } else if (state === S_LITERAL) {
      yield finishLiteral();
    }
    if (state !== S_DONE) {
      throw new JsonStreamParseError("Unexpected end of JSON input");
    }
  }
  var SafetensorsIndexParseError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "SafetensorsIndexParseError";
    }
  };
  var MAX_INDEX_BYTES = 25e7;
  var MAX_WEIGHT_MAP_ENTRIES = 2e5;
  var MAX_METADATA_ENTRIES = 1e3;
  var MAX_TOKEN_LENGTH = 1e5;
  var MAX_DEPTH2 = 64;
  var MAX_RETAINED_CHARS = 4e6;
  var MAX_WEIGHT_MAP_CHARS = 24e6;
  async function* limitBytes(stream, maxBytes) {
    let total = 0;
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        if (!value) {
          continue;
        }
        total += value.length;
        if (total > maxBytes) {
          throw new SafetensorsIndexParseError(
            `safetensors index is too big. Maximum supported size is ${maxBytes} bytes.`
          );
        }
        yield value;
      }
    } finally {
      await reader.cancel().catch(() => void 0);
    }
  }
  async function parseSafetensorsIndexStream(stream, options) {
    const maxBytes = options?.maxBytes ?? MAX_INDEX_BYTES;
    const maxWeightMapEntries = options?.maxWeightMapEntries ?? MAX_WEIGHT_MAP_ENTRIES;
    const maxShardCount = options?.maxShardCount ?? Infinity;
    const shardFilenames = [];
    const shardSet = /* @__PURE__ */ new Set();
    let weightMap = {};
    let weightMapEntryCount = 0;
    let retainedInWeightMap = 0;
    let metadata;
    let dtype;
    let depth = 0;
    let rootKey;
    let entryKey;
    let sawRootObject = false;
    let retainedChars = 0;
    const retain = (chars) => {
      retainedChars += chars;
      if (retainedChars > MAX_RETAINED_CHARS) {
        throw new SafetensorsIndexParseError(
          `safetensors index retains more than ${MAX_RETAINED_CHARS} characters of metadata/filenames`
        );
      }
    };
    for await (const event of streamJson(limitBytes(stream, maxBytes), {
      maxTokenLength: MAX_TOKEN_LENGTH,
      maxDepth: MAX_DEPTH2
    })) {
      switch (event.type) {
        case "startObject":
        case "startArray":
          depth++;
          if (depth === 1) {
            if (event.type === "startArray") {
              throw new SafetensorsIndexParseError("safetensors index must be a JSON object");
            }
            sawRootObject = true;
          }
          entryKey = void 0;
          break;
        case "endObject":
        case "endArray":
          depth--;
          if (depth <= 1) {
            rootKey = void 0;
            entryKey = void 0;
          }
          break;
        case "key":
          if (depth === 1) {
            rootKey = event.key;
            entryKey = void 0;
          } else {
            entryKey = event.key;
          }
          break;
        case "value": {
          if (depth === 1) {
            if (rootKey === "dtype" && typeof event.value === "string") {
              dtype = event.value;
            }
            rootKey = void 0;
            break;
          }
          if (depth !== 2 || entryKey === void 0) {
            break;
          }
          if (rootKey === "weight_map") {
            if (typeof event.value !== "string") {
              break;
            }
            weightMapEntryCount++;
            if (!shardSet.has(event.value)) {
              retain(event.value.length);
              shardSet.add(event.value);
              shardFilenames.push(event.value);
              if (shardSet.size > maxShardCount) {
                throw new SafetensorsIndexParseError(
                  `Too many shard files (>${maxShardCount}). Maximum supported is ${maxShardCount}.`
                );
              }
            }
            if (weightMap !== void 0) {
              retainedInWeightMap += entryKey.length + event.value.length;
              if (weightMapEntryCount > maxWeightMapEntries || retainedInWeightMap > MAX_WEIGHT_MAP_CHARS) {
                weightMap = void 0;
              } else {
                weightMap[entryKey] = event.value;
              }
            }
          } else if (rootKey === "metadata") {
            metadata ?? (metadata = {});
            if (Object.keys(metadata).length < MAX_METADATA_ENTRIES) {
              retain(entryKey.length + (typeof event.value === "string" ? event.value.length : 8));
              metadata[entryKey] = event.value;
            }
          }
          entryKey = void 0;
          break;
        }
      }
    }
    if (!sawRootObject) {
      throw new SafetensorsIndexParseError("safetensors index must be a JSON object");
    }
    return { dtype, metadata, shardFilenames, weightMapEntryCount, weightMap };
  }
  var SAFETENSORS_FILE = "model.safetensors";
  var SAFETENSORS_INDEX_FILE = "model.safetensors.index.json";
  var DIFFUSERS_SAFETENSORS_FILE = "diffusion_pytorch_model.safetensors";
  var DIFFUSERS_SAFETENSORS_INDEX_FILE = "diffusion_pytorch_model.safetensors.index.json";
  var DIFFUSERS_WEIGHTS_SUBFOLDERS = ["transformer", "unet"];
  var RE_SAFETENSORS_FILE = /\.safetensors$/;
  var RE_SAFETENSORS_INDEX_FILE = /\.safetensors\.index\.json$/;
  var RE_SAFETENSORS_SHARD_FILE = /^(?<prefix>(?<basePrefix>.*?)[_-])(?<shard>\d{5,6})-of-(?<total>\d{5,6})\.safetensors$/;
  function parseSafetensorsShardFilename(filename) {
    const match = RE_SAFETENSORS_SHARD_FILE.exec(filename);
    if (match && match.groups) {
      return {
        prefix: match.groups["prefix"],
        basePrefix: match.groups["basePrefix"],
        shard: match.groups["shard"],
        total: match.groups["total"]
      };
    }
    return null;
  }
  var PARALLEL_DOWNLOADS = 20;
  var MAX_HEADER_LENGTH = 25e6;
  var MAX_CONFIG_LENGTH = 1e7;
  var MAX_SHARD_COUNT = 1e4;
  var MAX_TENSOR_DIM = 2 ** 32;
  var GPTQ_QWEIGHT_SUFFIX = "qweight";
  var GPTQ_AWQ_AUXILIARY_SUFFIXES = ["qzeros", "g_idx", "scales"];
  var MLX_QUANTIZATION_METHOD = "mlx";
  var MLX_QUANTIZATION_MODES = /* @__PURE__ */ new Set(["affine", "mxfp4", "nvfp4", "mxfp8"]);
  var MLX_AFFINE_BITS = /* @__PURE__ */ new Set([2, 3, 4, 5, 6, 8]);
  var MLX_AFFINE_GROUP_SIZES = /* @__PURE__ */ new Set([32, 64, 128]);
  var QUANTIZATION_AUXILIARY_SUFFIXES = [
    // NB: a bare `.scale` / `.scales` is deliberately absent — some architectures have *learnable*
    // scale parameters under that name, and dropping those would undercount. The block scales that
    // do use it (e.g. DeepSeek-V4's `attn.wkv.scale`) are caught by SCALE_ONLY_DTYPES instead,
    // and GPTQ/AWQ `scales` is already handled by the gptq/awq branch below.
    "weight_scale",
    "weight_scale_inv",
    "weight_scale_2",
    "weight_global_scale",
    "weight_zero_point",
    "input_scale",
    "input_global_scale",
    "input_zero_point",
    "zero_point",
    // compressed-tensors records each packed tensor's logical shape alongside it; it's a 2-element
    // I32 tensor, so it was not only counted but multiplied by the packing factor.
    "weight_shape",
    // Activation-ordering permutation indices, emitted by the pack-quantized compressor whenever
    // `actorder: "group"`. One I32 index per input column, so — like `weight_shape` — it was both
    // counted and scaled by the packing factor.
    "weight_g_idx"
  ];
  var MXFP4_SCALES_SUFFIX = "_scales";
  var BITSANDBYTES_AUXILIARY_SUFFIXES = ["absmax", "quant_map", "nested_absmax", "nested_quant_map"];
  var BITSANDBYTES_QUANT_STATE_PREFIX = "bitsandbytes__";
  var SCALE_ONLY_DTYPES = /* @__PURE__ */ new Set(["F8_E8M0", "E8M0", "UE8"]);
  var INTEGER_CONTAINER_BITS = {
    U8: 8,
    I8: 8,
    U16: 16,
    I16: 16,
    U32: 32,
    I32: 32
  };
  var SUB_BYTE_FORMAT_BITS = [
    ["nvfp4", 4],
    ["mxfp4", 4],
    ["fp4", 4],
    ["int4", 4],
    ["uint4", 4],
    ["nf4", 4],
    ["int2", 2]
  ];
  function isRoutedExpertTensor(tensorName) {
    return tensorName.includes(".experts.") && !tensorName.includes("shared_experts");
  }
  function bitsFromFormatString(format) {
    if (typeof format !== "string") {
      return void 0;
    }
    const normalized = format.toLowerCase();
    return SUB_BYTE_FORMAT_BITS.find(([pattern]) => normalized.includes(pattern))?.[1];
  }
  function packingFactor(dtype, numBits) {
    const containerBits = INTEGER_CONTAINER_BITS[dtype];
    if (!containerBits || !numBits || numBits <= 0 || numBits >= containerBits) {
      return 1;
    }
    return containerBits / numBits;
  }
  var SafetensorParseError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "SafetensorParseError";
    }
  };
  function validateTensorEntry(path, tensorName, info, fileSizeBytes) {
    if (!Array.isArray(info.shape) || !Array.isArray(info.data_offsets) || info.data_offsets.length !== 2) {
      throw new SafetensorParseError(`Failed to parse file ${path}: tensor "${tensorName}" is malformed.`);
    }
    for (const dim of info.shape) {
      if (!Number.isFinite(dim) || !Number.isInteger(dim) || dim < 0) {
        throw new SafetensorParseError(
          `Failed to parse file ${path}: tensor "${tensorName}" has an invalid dimension (${dim}).`
        );
      }
      if (dim > MAX_TENSOR_DIM) {
        throw new SafetensorParseError(
          `Failed to parse file ${path}: tensor "${tensorName}" dimension is ${dim}, which exceeds the maximum allowed (${MAX_TENSOR_DIM}).`
        );
      }
    }
    const [begin, end] = info.data_offsets;
    if (!Number.isFinite(begin) || !Number.isFinite(end) || !Number.isInteger(begin) || !Number.isInteger(end) || begin < 0 || end < begin) {
      throw new SafetensorParseError(`Failed to parse file ${path}: tensor "${tensorName}" has invalid data_offsets.`);
    }
    if (fileSizeBytes !== void 0 && end > fileSizeBytes) {
      throw new SafetensorParseError(
        `Failed to parse file ${path}: tensor "${tensorName}" declares data_offsets ending at ${end}, which exceeds the file size (${fileSizeBytes} bytes). The file is malformed.`
      );
    }
  }
  async function fetchModelConfig(params) {
    try {
      const configBlob = await downloadFile({
        ...params,
        path: "config.json"
      });
      if (!configBlob) {
        return null;
      }
      const config = JSON.parse(await configBlob.slice(0, MAX_CONFIG_LENGTH).text());
      return config;
    } catch (error) {
      return null;
    }
  }
  async function parseSingleFile(path, params) {
    const blob = await downloadFile({ ...params, path });
    if (!blob) {
      throw new SafetensorParseError(`Failed to parse file ${path}: failed to fetch safetensors header length.`);
    }
    const bufLengthOfHeaderLE = await blob.slice(0, 8).arrayBuffer();
    const lengthOfHeader = new DataView(bufLengthOfHeaderLE).getBigUint64(0, true);
    if (lengthOfHeader <= 0) {
      throw new SafetensorParseError(`Failed to parse file ${path}: safetensors header is malformed.`);
    }
    if (lengthOfHeader > MAX_HEADER_LENGTH) {
      throw new SafetensorParseError(
        `Failed to parse file ${path}: safetensor header is too big. Maximum supported size is ${MAX_HEADER_LENGTH} bytes.`
      );
    }
    let header;
    try {
      header = JSON.parse(await blob.slice(8, 8 + Number(lengthOfHeader)).text());
    } catch (err) {
      throw new SafetensorParseError(`Failed to parse file ${path}: safetensors header is not valid JSON.`);
    }
    const fileSizeBytes = Number.isFinite(blob.size) && blob.size >= 0 ? blob.size : void 0;
    for (const [tensorName, info] of typedEntries(omit(header, "__metadata__"))) {
      validateTensorEntry(path, tensorName, info, fileSizeBytes);
    }
    return { header, fileSizeBytes };
  }
  async function parseShardedIndex(path, params) {
    const indexBlob = await downloadFile({
      ...params,
      path
    });
    if (!indexBlob) {
      throw new SafetensorParseError(`Failed to parse file ${path}: failed to fetch safetensors index.`);
    }
    try {
      const { dtype, metadata, shardFilenames, weightMap } = await parseSafetensorsIndexStream(indexBlob.stream(), {
        maxShardCount: MAX_SHARD_COUNT
      });
      return {
        index: { dtype, metadata, weight_map: weightMap },
        shardFilenames
      };
    } catch (error) {
      throw new SafetensorParseError(
        `Failed to parse file ${path}: ${error instanceof Error ? error.message : "not a valid JSON."}`
      );
    }
  }
  function assertSafeShardFilename(filename) {
    const unsafe = (reason) => {
      throw new SafetensorParseError(`Unsafe shard filename in weight_map: "${filename}" (${reason})`);
    };
    if (!filename) {
      unsafe("empty");
    }
    let decoded = filename;
    for (let i = 0; i < 5; i++) {
      let next;
      try {
        next = decodeURIComponent(decoded);
      } catch {
        return unsafe("malformed percent-encoding");
      }
      if (next === decoded) {
        break;
      }
      decoded = next;
    }
    for (const candidate of /* @__PURE__ */ new Set([filename, decoded])) {
      for (let i = 0; i < candidate.length; i++) {
        const code = candidate.charCodeAt(i);
        if (code <= 31 || code === 127) {
          unsafe("control character");
        }
      }
      if (candidate.includes("\\")) {
        unsafe("backslash");
      }
      if (candidate.startsWith("/")) {
        unsafe("absolute path");
      }
      if (candidate.slice(0, candidate.indexOf("/") === -1 ? candidate.length : candidate.indexOf("/")).includes(":")) {
        unsafe("scheme-like first path segment");
      }
      for (const segment of candidate.split("/")) {
        if (segment === "." || segment === "..") {
          unsafe("dot segment");
        }
      }
    }
  }
  function encodeShardFilename(filename) {
    return filename.split("/").map(encodeURIComponent).join("/");
  }
  async function fetchAllHeaders(path, filenames, params) {
    const pathPrefix = path.slice(0, path.lastIndexOf("/") + 1);
    if (filenames.length > MAX_SHARD_COUNT) {
      throw new SafetensorParseError(
        `Too many shard files (${filenames.length}). Maximum supported is ${MAX_SHARD_COUNT}.`
      );
    }
    for (const filename of filenames) {
      assertSafeShardFilename(filename);
    }
    const shardedMap = Object.fromEntries(
      (await promisesQueue(
        filenames.map(
          (filename) => async () => [filename, await parseSingleFile(pathPrefix + encodeShardFilename(filename), params)]
        ),
        PARALLEL_DOWNLOADS
      )).map(([filename, { header }]) => [filename, header])
    );
    return shardedMap;
  }
  function parseTotalParameters(value, computedTotal) {
    if (!value) {
      return void 0;
    }
    const parsed = typeof value === "number" ? value : parseInt(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return void 0;
    }
    if (computedTotal !== void 0 && parsed > computedTotal) {
      return computedTotal;
    }
    return parsed;
  }
  var LIBRARY_WEIGHT_CANDIDATES = {
    // diffusers keeps the main module (the diffusion transformer / U-Net) under a subfolder,
    // or at the repo root for single-component repos (ControlNets, standalone VAEs). This matches
    // how a diffusion model's size is conventionally reported: the diffusion transformer / U-Net,
    // not the sum of VAE + text encoders.
    diffusers: [
      ...DIFFUSERS_WEIGHTS_SUBFOLDERS.map((folder) => ({
        single: `${folder}/${DIFFUSERS_SAFETENSORS_FILE}`,
        index: `${folder}/${DIFFUSERS_SAFETENSORS_INDEX_FILE}`
      })),
      { single: DIFFUSERS_SAFETENSORS_FILE, index: DIFFUSERS_SAFETENSORS_INDEX_FILE }
    ]
  };
  async function parseSafetensorsMetadata(params) {
    const repoId = toRepoId(params.repo);
    if (repoId.type !== "model") {
      throw new TypeError("Only model repos should contain safetensors files.");
    }
    const modelConfig = params.computeParametersCount ? await fetchModelConfig(params) : null;
    const quantConfig = getModelQuantizationConfig(modelConfig) ?? getModelQuantizationConfig(modelConfig?.text_config ?? null);
    const expertDtype = modelConfig?.expert_dtype ?? modelConfig?.text_config?.expert_dtype;
    let location;
    if (params.path) {
      if (RE_SAFETENSORS_FILE.test(params.path)) {
        location = { path: params.path, sharded: false };
      } else if (RE_SAFETENSORS_INDEX_FILE.test(params.path)) {
        location = { path: params.path, sharded: true };
      }
    } else {
      const candidates = [
        { single: SAFETENSORS_FILE, index: SAFETENSORS_INDEX_FILE },
        ...params.library ? LIBRARY_WEIGHT_CANDIDATES[params.library] ?? [] : []
      ];
      for (const { single, index } of candidates) {
        if (await fileExists({ ...params, path: single })) {
          location = { path: single, sharded: false };
          break;
        }
        if (await fileExists({ ...params, path: index })) {
          location = { path: index, sharded: true };
          break;
        }
      }
    }
    if (location && !location.sharded) {
      const { header } = await parseSingleFile(location.path, params);
      const paramStats = params.computeParametersCount ? (() => {
        const parameterCount = computeNumOfParamsByDtypeSingleFile(header, quantConfig, expertDtype);
        return {
          parameterCount,
          /// shortcut: get param count directly from metadata
          parameterTotal: parseTotalParameters(
            header.__metadata__?.total_parameters,
            sum(Object.values(parameterCount))
          )
        };
      })() : void 0;
      return {
        sharded: false,
        header,
        ...paramStats,
        filepaths: [location.path]
      };
    } else if (location) {
      const path = location.path;
      const { index, shardFilenames } = await parseShardedIndex(path, params);
      const shardedMap = await fetchAllHeaders(path, shardFilenames, params);
      const pathPrefix = path.slice(0, path.lastIndexOf("/") + 1);
      const paramStats = params.computeParametersCount ? (() => {
        const parameterCount = computeNumOfParamsByDtypeSharded(shardedMap, quantConfig, expertDtype);
        return {
          parameterCount,
          /// shortcut: get param count directly from metadata
          parameterTotal: parseTotalParameters(index.metadata?.total_parameters, sum(Object.values(parameterCount)))
        };
      })() : void 0;
      return {
        sharded: true,
        index,
        headers: shardedMap,
        ...paramStats,
        filepaths: [path, ...Object.keys(shardedMap).map((filename) => pathPrefix + filename)]
      };
    } else {
      throw new Error("model id does not seem to contain safetensors weights");
    }
  }
  function getQuantizationMethod(quantConfig) {
    return typeof quantConfig?.quant_method === "string" ? quantConfig.quant_method.toLowerCase() : void 0;
  }
  var MLX_MODE_DEFAULTS = {
    affine: { bits: 4, groupSize: 64 },
    mxfp4: { bits: 4, groupSize: 32 },
    nvfp4: { bits: 4, groupSize: 16 },
    mxfp8: { bits: 8, groupSize: 32 }
  };
  function parseMlxQuantizationParameters(bits, groupSize, mode) {
    if (mode !== void 0 && typeof mode !== "string") {
      return void 0;
    }
    const normalizedMode = (mode ?? "affine").toLowerCase();
    if (!MLX_QUANTIZATION_MODES.has(normalizedMode)) {
      return void 0;
    }
    const defaults = MLX_MODE_DEFAULTS[normalizedMode];
    const resolvedBits = bits ?? defaults.bits;
    const resolvedGroupSize = groupSize ?? defaults.groupSize;
    if (typeof resolvedBits !== "number" || !Number.isInteger(resolvedBits) || typeof resolvedGroupSize !== "number" || !Number.isInteger(resolvedGroupSize)) {
      return void 0;
    }
    const valid = normalizedMode === "affine" && MLX_AFFINE_BITS.has(resolvedBits) && MLX_AFFINE_GROUP_SIZES.has(resolvedGroupSize) || normalizedMode === "mxfp4" && resolvedBits === 4 && resolvedGroupSize === 32 || normalizedMode === "nvfp4" && resolvedBits === 4 && resolvedGroupSize === 16 || normalizedMode === "mxfp8" && resolvedBits === 8 && resolvedGroupSize === 32;
    return valid ? { bits: resolvedBits, groupSize: resolvedGroupSize, mode: normalizedMode } : void 0;
  }
  function hasMlxParameterFields(value) {
    return "bits" in value || "group_size" in value || "mode" in value;
  }
  function hasValidMlxConfiguration(quantConfig) {
    if (hasMlxParameterFields(quantConfig) && parseMlxQuantizationParameters(quantConfig.bits, quantConfig.group_size, quantConfig.mode)) {
      return true;
    }
    return Object.values(quantConfig).some(
      (value) => typeof value === "object" && value !== null && hasMlxParameterFields(value) && Boolean(
        parseMlxQuantizationParameters(
          value.bits,
          value.group_size,
          value.mode
        )
      )
    );
  }
  function getModelQuantizationConfig(modelConfig) {
    const mlxConfig = modelConfig?.quantization;
    const mlxMethod = getQuantizationMethod(mlxConfig);
    if (mlxConfig && (mlxConfig.quant_method === void 0 || mlxMethod === MLX_QUANTIZATION_METHOD) && hasValidMlxConfiguration(mlxConfig)) {
      return {
        ...mlxConfig,
        quant_method: MLX_QUANTIZATION_METHOD,
        mode: mlxConfig.mode ?? "affine"
      };
    }
    const quantConfig = modelConfig?.quantization_config;
    const quantMethod = getQuantizationMethod(quantConfig);
    if (quantConfig && (quantConfig.quant_method === void 0 || quantMethod === MLX_QUANTIZATION_METHOD)) {
      const mode = quantConfig.mode ?? "affine";
      if (hasValidMlxConfiguration(quantConfig)) {
        return { ...quantConfig, mode, quant_method: MLX_QUANTIZATION_METHOD };
      }
    }
    return quantConfig;
  }
  function getMlxQuantizationParameters(tensorName, quantConfig) {
    const moduleName = getTensorModuleName(tensorName);
    const moduleConfig = quantConfig[moduleName];
    if (moduleConfig === false) {
      return void 0;
    }
    const override = typeof moduleConfig === "object" && moduleConfig !== null ? moduleConfig : void 0;
    return override ? parseMlxQuantizationParameters(override.bits, override.group_size, override.mode) : parseMlxQuantizationParameters(quantConfig.bits, quantConfig.group_size, quantConfig.mode);
  }
  function getTensorModuleName(tensorName) {
    const suffixIndex = tensorName.lastIndexOf(".");
    return suffixIndex === -1 ? tensorName : tensorName.slice(0, suffixIndex);
  }
  function getMlxQuantizedModules(headers, quantConfig) {
    if (!quantConfig || getQuantizationMethod(quantConfig) !== MLX_QUANTIZATION_METHOD) {
      return void 0;
    }
    const modulesWithScales = /* @__PURE__ */ new Set();
    const modulesWithBiases = /* @__PURE__ */ new Set();
    const modulesWithU32Weights = /* @__PURE__ */ new Set();
    for (const header of headers) {
      for (const [tensorName, info] of typedEntries(omit(header, "__metadata__"))) {
        const suffix = getTensorSuffix(tensorName);
        if (suffix === "scales") {
          modulesWithScales.add(getTensorModuleName(tensorName));
        } else if (suffix === "biases") {
          modulesWithBiases.add(getTensorModuleName(tensorName));
        } else if (suffix === "weight" && info.dtype === "U32") {
          modulesWithU32Weights.add(getTensorModuleName(tensorName));
        }
      }
    }
    const quantizedModules = /* @__PURE__ */ new Set();
    for (const moduleName of modulesWithU32Weights) {
      const params = getMlxQuantizationParameters(`${moduleName}.weight`, quantConfig);
      if (params && modulesWithScales.has(moduleName) && (params.mode !== "affine" || modulesWithBiases.has(moduleName))) {
        quantizedModules.add(moduleName);
      }
    }
    return quantizedModules;
  }
  function globMatch(pattern, str) {
    const parts = pattern.split("*");
    if (parts.length === 1) {
      return pattern === str;
    }
    if (!str.startsWith(parts[0])) {
      return false;
    }
    let pos = parts[0].length;
    const lastPart = parts[parts.length - 1];
    if (!str.endsWith(lastPart)) {
      return false;
    }
    const end = str.length - lastPart.length;
    for (let i = 1; i < parts.length - 1; i++) {
      const idx = str.indexOf(parts[i], pos);
      if (idx === -1 || idx + parts[i].length > end) {
        return false;
      }
      pos = idx + parts[i].length;
    }
    return pos <= end;
  }
  function isQuantizedTensor(tensorName, quantConfig, mlxQuantizedModules) {
    if (!quantConfig) {
      return false;
    }
    if (getQuantizationMethod(quantConfig) === MLX_QUANTIZATION_METHOD) {
      return getMlxQuantizationParameters(tensorName, quantConfig) !== void 0 && (mlxQuantizedModules === void 0 || mlxQuantizedModules.has(getTensorModuleName(tensorName)));
    }
    if (quantConfig.ignore?.length) {
      const suffixIndex = tensorName.lastIndexOf(".weight");
      const moduleName = suffixIndex === -1 ? tensorName : tensorName.slice(0, suffixIndex);
      if (quantConfig.ignore.some((target) => matchesCompressedTensorsTarget(target, moduleName))) {
        return false;
      }
    }
    const patterns = quantConfig.modules_to_not_convert;
    if (!patterns?.length) {
      return true;
    }
    return !patterns.some(
      (pattern) => pattern.includes("*") ? globMatch(pattern, tensorName) : tensorName.includes(pattern)
    );
  }
  function matchesCompressedTensorsTarget(target, moduleName) {
    if (!target.startsWith("re:")) {
      return target === moduleName;
    }
    let pattern = target.slice(3);
    if (pattern.startsWith("^")) {
      pattern = pattern.slice(1);
    }
    if (pattern.endsWith("$")) {
      pattern = pattern.slice(0, -1);
    } else {
      pattern += ".*";
    }
    const glob = pattern.replaceAll(".*", "*").replaceAll("\\.", ".");
    if (/[\\+?()[\]{}|^$]/.test(glob)) {
      return false;
    }
    return globMatch(glob, moduleName);
  }
  function getQuantizationMultiplier(tensorName, dtype, quantConfig, expertDtype, mlxQuantizedModules) {
    if (!quantConfig || !isQuantizedTensor(tensorName, quantConfig, mlxQuantizedModules)) {
      return 1;
    }
    const quantMethod = getQuantizationMethod(quantConfig);
    switch (quantMethod) {
      case MLX_QUANTIZATION_METHOD: {
        if (dtype !== "U32" || getTensorSuffix(tensorName) !== "weight") {
          return 1;
        }
        return packingFactor(dtype, getMlxQuantizationParameters(tensorName, quantConfig)?.bits);
      }
      case "mxfp4":
        if (dtype === "U8" && tensorName.includes("_blocks")) {
          return 2;
        }
        return 1;
      case "gptq":
      case "awq":
        if (getTensorSuffix(tensorName) === GPTQ_QWEIGHT_SUFFIX) {
          const bits = quantConfig.bits && quantConfig.bits > 0 ? quantConfig.bits : 4;
          return Math.max(1, Math.floor(32 / bits));
        }
        if (quantConfig.bits === 4 && dtype === "U8") {
          return 2;
        }
        if (quantConfig.bits === 2 && dtype === "U8") {
          return 4;
        }
        return 1;
      case "compressed-tensors": {
        if (!INTEGER_CONTAINER_BITS[dtype]) {
          return 1;
        }
        const groups = Object.values(quantConfig.config_groups ?? {});
        const suffixIndex = tensorName.lastIndexOf(".weight");
        const moduleName = suffixIndex === -1 ? tensorName : tensorName.slice(0, suffixIndex);
        const group = groups.find((g) => g.targets?.some((target) => matchesCompressedTensorsTarget(target, moduleName)));
        const format = (group?.format ?? quantConfig.format)?.toLowerCase();
        if (!format?.endsWith("pack-quantized")) {
          return 1;
        }
        const numBits = group?.weights?.num_bits ?? groups.find((g) => g.weights?.num_bits)?.weights?.num_bits ?? // the format string itself carries the width when num_bits is absent
        bitsFromFormatString(format) ?? 4;
        return packingFactor(dtype, numBits);
      }
      case "fp8": {
        if (!isRoutedExpertTensor(tensorName)) {
          return 1;
        }
        return packingFactor(
          dtype,
          bitsFromFormatString(quantConfig.expert_dtype ?? expertDtype ?? quantConfig.store_dtype)
        );
      }
      case "bitsandbytes":
        if (quantConfig.load_in_4bit && dtype === "U8") {
          return 2;
        }
        return 1;
      default:
        if (dtype === "U8" && (quantConfig.load_in_4bit || quantConfig.bits === 4)) {
          return 2;
        }
        return 1;
    }
  }
  function computeNumOfParamsByDtypeSingleFile(header, quantConfig, expertDtype) {
    return computeNumOfParamsByDtypeForHeader(
      header,
      quantConfig,
      expertDtype,
      getMlxQuantizedModules([header], quantConfig)
    );
  }
  function computeNumOfParamsByDtypeForHeader(header, quantConfig, expertDtype, mlxQuantizedModules) {
    const counter = {};
    const tensors = omit(header, "__metadata__");
    for (const [tensorName, v] of typedEntries(tensors)) {
      if (shouldSkipTensor(tensorName, v.dtype, quantConfig, mlxQuantizedModules)) {
        continue;
      }
      if (v.shape.length === 0) {
        continue;
      }
      const elements = v.shape.reduce((a, b) => a * b);
      if (!Number.isFinite(elements)) {
        continue;
      }
      const multiplier = quantConfig ? getQuantizationMultiplier(tensorName, v.dtype, quantConfig, expertDtype, mlxQuantizedModules) : 1;
      if (multiplier === 0) {
        continue;
      }
      counter[v.dtype] = (counter[v.dtype] ?? 0) + Math.round(elements * multiplier);
    }
    return counter;
  }
  function computeNumOfParamsByDtypeSharded(shardedMap, quantConfig, expertDtype) {
    const counter = {};
    const headers = Object.values(shardedMap);
    const mlxQuantizedModules = getMlxQuantizedModules(headers, quantConfig);
    for (const header of headers) {
      for (const [k, v] of typedEntries(
        computeNumOfParamsByDtypeForHeader(header, quantConfig, expertDtype, mlxQuantizedModules)
      )) {
        counter[k] = (counter[k] ?? 0) + (v ?? 0);
      }
    }
    return counter;
  }
  function getTensorSuffix(tensorName) {
    const lastDotIndex = tensorName.lastIndexOf(".");
    return lastDotIndex === -1 ? tensorName : tensorName.slice(lastDotIndex + 1);
  }
  function shouldSkipTensor(tensorName, dtype, quantConfig, mlxQuantizedModules) {
    if (SCALE_ONLY_DTYPES.has(dtype)) {
      return true;
    }
    if (!quantConfig) {
      return false;
    }
    if (QUANTIZATION_AUXILIARY_SUFFIXES.includes(getTensorSuffix(tensorName))) {
      return true;
    }
    const quantMethod = getQuantizationMethod(quantConfig);
    if (quantMethod === MLX_QUANTIZATION_METHOD && isQuantizedTensor(tensorName, quantConfig, mlxQuantizedModules)) {
      const suffix2 = getTensorSuffix(tensorName);
      const mode = getMlxQuantizationParameters(tensorName, quantConfig)?.mode;
      return suffix2 === "scales" || suffix2 === "biases" && mode === "affine";
    }
    if (quantMethod === "mxfp4") {
      return dtype === "U8" && getTensorSuffix(tensorName).endsWith(MXFP4_SCALES_SUFFIX);
    }
    if (quantMethod === "bitsandbytes") {
      const bnbSuffix = getTensorSuffix(tensorName);
      return BITSANDBYTES_AUXILIARY_SUFFIXES.includes(bnbSuffix) || bnbSuffix.startsWith(BITSANDBYTES_QUANT_STATE_PREFIX);
    }
    if (quantMethod !== "gptq" && quantMethod !== "awq") {
      return false;
    }
    if (!isQuantizedTensor(tensorName, quantConfig)) {
      return false;
    }
    const suffix = getTensorSuffix(tensorName);
    return suffix !== GPTQ_QWEIGHT_SUFFIX && GPTQ_AWQ_AUXILIARY_SUFFIXES.includes(suffix);
  }
  async function repoExists(params) {
    const repoId = toRepoId(params.repo);
    const res = await (params.fetch ?? fetch)(
      `${params.hubUrl ?? HUB_URL}/api/${repoId.type}s/${repoId.name}?expand[]=likes`,
      {
        method: "GET",
        headers: {
          ...params.accessToken && {
            Authorization: `Bearer ${params.accessToken}`
          }
        }
      }
    );
    if (res.status === 404 || res.status === 401) {
      return false;
    }
    if (!res.ok) {
      throw await createApiError(res);
    }
    return true;
  }
  async function spaceInfo(params) {
    const accessToken = params && checkCredentials(params);
    const search = new URLSearchParams([
      ...SPACE_EXPAND_KEYS.map((val) => ["expand", val]),
      ...params?.additionalFields?.map((val) => ["expand", val]) ?? []
    ]).toString();
    const response = await (params.fetch || fetch)(
      `${params?.hubUrl || HUB_URL}/api/spaces/${params.name}/revision/${encodeURIComponent(
        params.revision ?? "HEAD"
      )}?${search.toString()}`,
      {
        headers: {
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );
    if (!response.ok) {
      throw await createApiError(response);
    }
    const data = await response.json();
    return {
      ...params?.additionalFields && pick(data, params.additionalFields),
      id: data._id,
      name: data.id,
      sdk: data.sdk,
      likes: data.likes,
      private: data.private,
      updatedAt: new Date(data.lastModified)
    };
  }
  function uploadFile(params) {
    const path = params.file instanceof URL ? params.file.pathname.split("/").at(-1) ?? "file" : "path" in params.file ? params.file.path : params.file.name;
    const operation = typeof params.file === "object" && "edits" in params.file ? {
      operation: "edit",
      path,
      originalContent: params.file.originalContent,
      edits: params.file.edits
    } : {
      operation: "addOrUpdate",
      path,
      content: "content" in params.file ? params.file.content : params.file
    };
    return commit({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      repo: params.repo,
      operations: [operation],
      title: params.commitTitle ?? `${operation.operation === "edit" ? "Edit" : "Add"} ${path}`,
      description: params.commitDescription,
      hubUrl: params.hubUrl,
      branch: params.branch,
      isPullRequest: params.isPullRequest,
      parentCommit: params.parentCommit,
      fetch: params.fetch,
      useWebWorkers: params.useWebWorkers,
      abortSignal: params.abortSignal,
      useXet: params.useXet,
      rangeEditCache: params.rangeEditCache
    });
  }
  function uploadFiles(params) {
    const operations = params.files.map((file) => {
      const path = file instanceof URL ? file.pathname.split("/").at(-1) ?? "file" : "path" in file ? file.path : file.name;
      if (typeof file === "object" && "edits" in file) {
        return {
          operation: "edit",
          path,
          originalContent: file.originalContent,
          edits: file.edits
        };
      }
      return {
        operation: "addOrUpdate",
        path,
        content: "content" in file ? file.content : file
      };
    });
    return commit({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      repo: params.repo,
      operations,
      title: params.commitTitle ?? `Add ${params.files.length} files`,
      description: params.commitDescription,
      hubUrl: params.hubUrl,
      branch: params.branch,
      isPullRequest: params.isPullRequest,
      parentCommit: params.parentCommit,
      fetch: params.fetch,
      useWebWorkers: params.useWebWorkers,
      abortSignal: params.abortSignal,
      useXet: params.useXet,
      rangeEditCache: params.rangeEditCache
    });
  }
  var multipartUploadTracking = /* @__PURE__ */ new WeakMap();
  async function* uploadFilesWithProgress(params) {
    const operations = params.files.map((file) => {
      const path = file instanceof URL ? file.pathname.split("/").at(-1) ?? "file" : "path" in file ? file.path : file.name;
      if (typeof file === "object" && "edits" in file) {
        return {
          operation: "edit",
          path,
          originalContent: file.originalContent,
          edits: file.edits
        };
      }
      return {
        operation: "addOrUpdate",
        path,
        content: "content" in file ? file.content : file
      };
    });
    return yield* commitIter({
      ...params.accessToken ? { accessToken: params.accessToken } : { credentials: params.credentials },
      repo: params.repo,
      operations,
      title: params.commitTitle ?? `Add ${params.files.length} files`,
      description: params.commitDescription,
      hubUrl: params.hubUrl,
      branch: params.branch,
      isPullRequest: params.isPullRequest,
      parentCommit: params.parentCommit,
      useWebWorkers: params.useWebWorkers,
      abortSignal: params.abortSignal,
      useXet: params.useXet,
      rangeEditCache: params.rangeEditCache,
      fetch: async (input, init) => {
        if (!init) {
          return fetch(input);
        }
        if (!typedInclude(["PUT", "POST"], init.method) || !("progressHint" in init) || !init.progressHint || typeof XMLHttpRequest === "undefined" || typeof input !== "string" || !(init.body instanceof ArrayBuffer) && !(init.body instanceof Blob) && !(init.body instanceof File) && typeof init.body !== "string") {
          return fetch(input, init);
        }
        const progressHint = init.progressHint;
        const progressCallback = progressHint.progressCallback;
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            if (progressHint.part !== void 0) {
              let tracking = multipartUploadTracking.get(progressCallback);
              if (!tracking) {
                tracking = { numParts: progressHint.numParts, partsProgress: {} };
                multipartUploadTracking.set(progressCallback, tracking);
              }
              tracking.partsProgress[progressHint.part] = event.loaded / event.total;
              let totalProgress = 0;
              for (const partProgress of Object.values(tracking.partsProgress)) {
                totalProgress += partProgress;
              }
              if (totalProgress === tracking.numParts) {
                progressCallback(0.9999999999);
              } else {
                progressCallback(totalProgress / tracking.numParts);
              }
            } else {
              if (event.loaded === event.total) {
                progressCallback(0.9999999999);
              } else {
                progressCallback(event.loaded / event.total);
              }
            }
          }
        });
        xhr.open(init.method, input, true);
        if (init.headers) {
          const headers = new Headers(init.headers);
          headers.forEach((value, key) => {
            xhr.setRequestHeader(key, value);
          });
        }
        init.signal?.throwIfAborted();
        xhr.send(init.body);
        return new Promise((resolve2, reject) => {
          xhr.addEventListener("load", () => {
            resolve2(
              new Response(xhr.responseText, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: Object.fromEntries(
                  xhr.getAllResponseHeaders().trim().split("\n").map((header) => [
                    header.slice(0, header.indexOf(":")),
                    header.slice(header.indexOf(":") + 1).trim()
                  ])
                )
              })
            );
          });
          xhr.addEventListener("error", () => {
            reject(new Error(xhr.statusText));
          });
          if (init.signal) {
            init.signal.addEventListener("abort", () => {
              xhr.abort();
              try {
                init.signal?.throwIfAborted();
              } catch (err) {
                reject(err);
              }
            });
          }
        });
      }
    });
  }
  async function whoAmI(params) {
    const accessToken = checkCredentials(params);
    const res = await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/whoami-v2`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!res.ok) {
      throw await createApiError(res);
    }
    const response = await res.json();
    if (typeof response.auth.accessToken?.createdAt === "string") {
      response.auth.accessToken.createdAt = new Date(response.auth.accessToken.createdAt);
    }
    return response;
  }
  return __toCommonJS(browser_exports);
})();
