import { createRequire } from "node:module";
import { BrowserWindow, Menu, Notification, Tray, app, globalShortcut, ipcMain, nativeImage } from "electron";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
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
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
//#endregion
//#region src/main/modules/tray/index.ts
var tray = null;
function setupTray() {
	const iconPath = join(process.env.VITE_PUBLIC || join(import.meta.dirname, "../../public"), "favicon.svg");
	const icon = nativeImage.createFromPath(iconPath);
	tray = new Tray(icon);
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Daily Notch",
			enabled: false
		},
		{ type: "separator" },
		{
			label: "Toggle Focus",
			click: () => {}
		},
		{
			label: "Settings",
			click: () => {}
		},
		{ type: "separator" },
		{
			label: "Quit",
			click: () => {
				app.quit();
			}
		}
	]);
	tray.setToolTip("Daily Notch");
	tray.setContextMenu(contextMenu);
	return tray;
}
//#endregion
//#region node_modules/better-sqlite3/lib/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.getBooleanOption = (options, key) => {
		let value = false;
		if (key in options && typeof (value = options[key]) !== "boolean") throw new TypeError(`Expected the "${key}" option to be a boolean`);
		return value;
	};
	exports.cppdb = Symbol();
	exports.inspect = Symbol.for("nodejs.util.inspect.custom");
}));
//#endregion
//#region node_modules/better-sqlite3/lib/sqlite-error.js
var require_sqlite_error = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SqliteError = class SqliteError extends Error {
		constructor(message, code) {
			if (typeof code !== "string") throw new TypeError("Expected second argument to be a string");
			super("" + message);
			this.code = code;
			if (typeof Error.captureStackTrace === "function") Error.captureStackTrace(this, SqliteError);
		}
	};
	Object.defineProperty(SqliteError.prototype, "name", {
		value: "SqliteError",
		writable: true,
		enumerable: false,
		configurable: true
	});
	module.exports = SqliteError;
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/wrappers.js
var require_wrappers = /* @__PURE__ */ __commonJSMin(((exports) => {
	var { cppdb } = require_util();
	exports.prepare = function prepare(sql) {
		return this[cppdb].prepare(sql, this, false, false);
	};
	exports.exec = function exec(sql) {
		this[cppdb].exec(sql);
		return this;
	};
	exports.close = function close() {
		this[cppdb].close();
		return this;
	};
	exports.loadExtension = function loadExtension(...args) {
		this[cppdb].loadExtension(...args);
		return this;
	};
	exports.defaultSafeIntegers = function defaultSafeIntegers(...args) {
		this[cppdb].defaultSafeIntegers(...args);
		return this;
	};
	exports.unsafeMode = function unsafeMode(...args) {
		this[cppdb].unsafeMode(...args);
		return this;
	};
	exports.getters = {
		name: {
			get: function name() {
				return this[cppdb].name;
			},
			enumerable: true
		},
		open: {
			get: function open() {
				return this[cppdb].open;
			},
			enumerable: true
		},
		inTransaction: {
			get: function inTransaction() {
				return this[cppdb].inTransaction;
			},
			enumerable: true
		},
		readonly: {
			get: function readonly() {
				return this[cppdb].readonly;
			},
			enumerable: true
		},
		memory: {
			get: function memory() {
				return this[cppdb].memory;
			},
			enumerable: true
		}
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/transaction.js
var require_transaction = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { cppdb } = require_util();
	var controllers = /* @__PURE__ */ new WeakMap();
	module.exports = function transaction(fn) {
		if (typeof fn !== "function") throw new TypeError("Expected first argument to be a function");
		const db = this[cppdb];
		const controller = getController(db, this);
		const { apply } = Function.prototype;
		const properties = {
			default: { value: wrapTransaction(apply, fn, db, controller.default) },
			deferred: { value: wrapTransaction(apply, fn, db, controller.deferred) },
			immediate: { value: wrapTransaction(apply, fn, db, controller.immediate) },
			exclusive: { value: wrapTransaction(apply, fn, db, controller.exclusive) },
			database: {
				value: this,
				enumerable: true
			}
		};
		Object.defineProperties(properties.default.value, properties);
		Object.defineProperties(properties.deferred.value, properties);
		Object.defineProperties(properties.immediate.value, properties);
		Object.defineProperties(properties.exclusive.value, properties);
		return properties.default.value;
	};
	var getController = (db, self) => {
		let controller = controllers.get(db);
		if (!controller) {
			const shared = {
				commit: db.prepare("COMMIT", self, false, false),
				rollback: db.prepare("ROLLBACK", self, false, false),
				savepoint: db.prepare("SAVEPOINT `	_bs3.	`", self, false, false),
				release: db.prepare("RELEASE `	_bs3.	`", self, false, false),
				rollbackTo: db.prepare("ROLLBACK TO `	_bs3.	`", self, false, false)
			};
			controllers.set(db, controller = {
				default: Object.assign({ begin: db.prepare("BEGIN", self, false, false) }, shared),
				deferred: Object.assign({ begin: db.prepare("BEGIN DEFERRED", self, false, false) }, shared),
				immediate: Object.assign({ begin: db.prepare("BEGIN IMMEDIATE", self, false, false) }, shared),
				exclusive: Object.assign({ begin: db.prepare("BEGIN EXCLUSIVE", self, false, false) }, shared)
			});
		}
		return controller;
	};
	var wrapTransaction = (apply, fn, db, { begin, commit, rollback, savepoint, release, rollbackTo }) => function sqliteTransaction() {
		let before, after, undo;
		if (db.inTransaction) {
			before = savepoint;
			after = release;
			undo = rollbackTo;
		} else {
			before = begin;
			after = commit;
			undo = rollback;
		}
		before.run();
		try {
			const result = apply.call(fn, this, arguments);
			if (result && typeof result.then === "function") throw new TypeError("Transaction function cannot return a promise");
			after.run();
			return result;
		} catch (ex) {
			if (db.inTransaction) {
				undo.run();
				if (undo !== rollback) after.run();
			}
			throw ex;
		}
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/pragma.js
var require_pragma = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { getBooleanOption, cppdb } = require_util();
	module.exports = function pragma(source, options) {
		if (options == null) options = {};
		if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
		if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
		const simple = getBooleanOption(options, "simple");
		const stmt = this[cppdb].prepare(`PRAGMA ${source}`, this, true, false);
		return simple ? stmt.pluck().get() : stmt.all();
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/explain.js
var require_explain = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { cppdb } = require_util();
	module.exports = function explain(source) {
		if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
		return this[cppdb].prepare(`EXPLAIN ${source}`, this, false, true).all();
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/backup.js
var require_backup = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs$2 = __require("fs");
	var path$2 = __require("path");
	var { promisify } = __require("util");
	var { cppdb } = require_util();
	var fsAccess = promisify(fs$2.access);
	module.exports = async function backup(filename, options) {
		if (options == null) options = {};
		if (typeof filename !== "string") throw new TypeError("Expected first argument to be a string");
		if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
		filename = filename.trim();
		const attachedName = "attached" in options ? options.attached : "main";
		const handler = "progress" in options ? options.progress : null;
		if (!filename) throw new TypeError("Backup filename cannot be an empty string");
		if (filename === ":memory:") throw new TypeError("Invalid backup filename \":memory:\"");
		if (typeof attachedName !== "string") throw new TypeError("Expected the \"attached\" option to be a string");
		if (!attachedName) throw new TypeError("The \"attached\" option cannot be an empty string");
		if (handler != null && typeof handler !== "function") throw new TypeError("Expected the \"progress\" option to be a function");
		await fsAccess(path$2.dirname(filename)).catch(() => {
			throw new TypeError("Cannot save backup because the directory does not exist");
		});
		const isNewFile = await fsAccess(filename).then(() => false, () => true);
		return runBackup(this[cppdb].backup(this, attachedName, filename, isNewFile), handler || null);
	};
	var runBackup = (backup, handler) => {
		let rate = 0;
		let useDefault = true;
		return new Promise((resolve, reject) => {
			setImmediate(function step() {
				try {
					const progress = backup.transfer(rate);
					if (!progress.remainingPages) {
						backup.close();
						resolve(progress);
						return;
					}
					if (useDefault) {
						useDefault = false;
						rate = 100;
					}
					if (handler) {
						const ret = handler(progress);
						if (ret !== void 0) {
							if (typeof ret === "number" && ret === ret) rate = Math.max(0, Math.min(2147483647, Math.round(ret)));
							else throw new TypeError("Expected progress callback to return a number or undefined");
						}
					}
					setImmediate(step);
				} catch (err) {
					backup.close();
					reject(err);
				}
			});
		});
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/serialize.js
var require_serialize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { cppdb } = require_util();
	module.exports = function serialize(options) {
		if (options == null) options = {};
		if (typeof options !== "object") throw new TypeError("Expected first argument to be an options object");
		const attachedName = "attached" in options ? options.attached : "main";
		if (typeof attachedName !== "string") throw new TypeError("Expected the \"attached\" option to be a string");
		if (!attachedName) throw new TypeError("The \"attached\" option cannot be an empty string");
		return this[cppdb].serialize(attachedName);
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/function.js
var require_function = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { getBooleanOption, cppdb } = require_util();
	module.exports = function defineFunction(name, options, fn) {
		if (options == null) options = {};
		if (typeof options === "function") {
			fn = options;
			options = {};
		}
		if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
		if (typeof fn !== "function") throw new TypeError("Expected last argument to be a function");
		if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
		if (!name) throw new TypeError("User-defined function name cannot be an empty string");
		const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
		const deterministic = getBooleanOption(options, "deterministic");
		const directOnly = getBooleanOption(options, "directOnly");
		const varargs = getBooleanOption(options, "varargs");
		let argCount = -1;
		if (!varargs) {
			argCount = fn.length;
			if (!Number.isInteger(argCount) || argCount < 0) throw new TypeError("Expected function.length to be a positive integer");
			if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
		}
		this[cppdb].function(fn, name, argCount, safeIntegers, deterministic, directOnly);
		return this;
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/aggregate.js
var require_aggregate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { getBooleanOption, cppdb } = require_util();
	module.exports = function defineAggregate(name, options) {
		if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
		if (typeof options !== "object" || options === null) throw new TypeError("Expected second argument to be an options object");
		if (!name) throw new TypeError("User-defined function name cannot be an empty string");
		const start = "start" in options ? options.start : null;
		const step = getFunctionOption(options, "step", true);
		const inverse = getFunctionOption(options, "inverse", false);
		const result = getFunctionOption(options, "result", false);
		const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
		const deterministic = getBooleanOption(options, "deterministic");
		const directOnly = getBooleanOption(options, "directOnly");
		const varargs = getBooleanOption(options, "varargs");
		let argCount = -1;
		if (!varargs) {
			argCount = Math.max(getLength(step), inverse ? getLength(inverse) : 0);
			if (argCount > 0) argCount -= 1;
			if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
		}
		this[cppdb].aggregate(start, step, inverse, result, name, argCount, safeIntegers, deterministic, directOnly);
		return this;
	};
	var getFunctionOption = (options, key, required) => {
		const value = key in options ? options[key] : null;
		if (typeof value === "function") return value;
		if (value != null) throw new TypeError(`Expected the "${key}" option to be a function`);
		if (required) throw new TypeError(`Missing required option "${key}"`);
		return null;
	};
	var getLength = ({ length }) => {
		if (Number.isInteger(length) && length >= 0) return length;
		throw new TypeError("Expected function.length to be a positive integer");
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/table.js
var require_table = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { cppdb } = require_util();
	module.exports = function defineTable(name, factory) {
		if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
		if (!name) throw new TypeError("Virtual table module name cannot be an empty string");
		let eponymous = false;
		if (typeof factory === "object" && factory !== null) {
			eponymous = true;
			factory = defer(parseTableDefinition(factory, "used", name));
		} else {
			if (typeof factory !== "function") throw new TypeError("Expected second argument to be a function or a table definition object");
			factory = wrapFactory(factory);
		}
		this[cppdb].table(factory, name, eponymous);
		return this;
	};
	function wrapFactory(factory) {
		return function virtualTableFactory(moduleName, databaseName, tableName, ...args) {
			const thisObject = {
				module: moduleName,
				database: databaseName,
				table: tableName
			};
			const def = apply.call(factory, thisObject, args);
			if (typeof def !== "object" || def === null) throw new TypeError(`Virtual table module "${moduleName}" did not return a table definition object`);
			return parseTableDefinition(def, "returned", moduleName);
		};
	}
	function parseTableDefinition(def, verb, moduleName) {
		if (!hasOwnProperty.call(def, "rows")) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "rows" property`);
		if (!hasOwnProperty.call(def, "columns")) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "columns" property`);
		const rows = def.rows;
		if (typeof rows !== "function" || Object.getPrototypeOf(rows) !== GeneratorFunctionPrototype) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "rows" property (should be a generator function)`);
		let columns = def.columns;
		if (!Array.isArray(columns) || !isStringArray(columns = [...columns])) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "columns" property (should be an array of strings)`);
		if (columns.length !== new Set(columns).size) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate column names`);
		if (!columns.length) throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with zero columns`);
		let parameters;
		if (hasOwnProperty.call(def, "parameters")) {
			parameters = def.parameters;
			if (!Array.isArray(parameters) || !isStringArray(parameters = [...parameters])) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "parameters" property (should be an array of strings)`);
		} else parameters = inferParameters(rows);
		if (parameters.length !== new Set(parameters).size) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate parameter names`);
		if (parameters.length > 32) throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with more than the maximum number of 32 parameters`);
		for (const parameter of parameters) if (columns.includes(parameter)) throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with column "${parameter}" which was ambiguously defined as both a column and parameter`);
		let safeIntegers = 2;
		if (hasOwnProperty.call(def, "safeIntegers")) {
			const bool = def.safeIntegers;
			if (typeof bool !== "boolean") throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
			safeIntegers = +bool;
		}
		let directOnly = false;
		if (hasOwnProperty.call(def, "directOnly")) {
			directOnly = def.directOnly;
			if (typeof directOnly !== "boolean") throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "directOnly" property (should be a boolean)`);
		}
		return [
			`CREATE TABLE x(${[...parameters.map(identifier).map((str) => `${str} HIDDEN`), ...columns.map(identifier)].join(", ")});`,
			wrapGenerator(rows, new Map(columns.map((x, i) => [x, parameters.length + i])), moduleName),
			parameters,
			safeIntegers,
			directOnly
		];
	}
	function wrapGenerator(generator, columnMap, moduleName) {
		return function* virtualTable(...args) {
			const output = args.map((x) => Buffer.isBuffer(x) ? Buffer.from(x) : x);
			for (let i = 0; i < columnMap.size; ++i) output.push(null);
			for (const row of generator(...args)) if (Array.isArray(row)) {
				extractRowArray(row, output, columnMap.size, moduleName);
				yield output;
			} else if (typeof row === "object" && row !== null) {
				extractRowObject(row, output, columnMap, moduleName);
				yield output;
			} else throw new TypeError(`Virtual table module "${moduleName}" yielded something that isn't a valid row object`);
		};
	}
	function extractRowArray(row, output, columnCount, moduleName) {
		if (row.length !== columnCount) throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an incorrect number of columns`);
		const offset = output.length - columnCount;
		for (let i = 0; i < columnCount; ++i) output[i + offset] = row[i];
	}
	function extractRowObject(row, output, columnMap, moduleName) {
		let count = 0;
		for (const key of Object.keys(row)) {
			const index = columnMap.get(key);
			if (index === void 0) throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an undeclared column "${key}"`);
			output[index] = row[key];
			count += 1;
		}
		if (count !== columnMap.size) throw new TypeError(`Virtual table module "${moduleName}" yielded a row with missing columns`);
	}
	function inferParameters({ length }) {
		if (!Number.isInteger(length) || length < 0) throw new TypeError("Expected function.length to be a positive integer");
		const params = [];
		for (let i = 0; i < length; ++i) params.push(`$${i + 1}`);
		return params;
	}
	var { hasOwnProperty } = Object.prototype;
	var { apply } = Function.prototype;
	var GeneratorFunctionPrototype = Object.getPrototypeOf(function* () {});
	var identifier = (str) => `"${str.replace(/"/g, "\"\"")}"`;
	var defer = (x) => () => x;
	var isStringArray = (arr) => {
		for (let i = 0; i < arr.length; ++i) if (typeof arr[i] !== "string") return false;
		return true;
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/methods/inspect.js
var require_inspect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DatabaseInspection = function Database() {};
	module.exports = function inspect(depth, opts) {
		return Object.assign(new DatabaseInspection(), this);
	};
}));
//#endregion
//#region node_modules/better-sqlite3/lib/database.js
var require_database = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs$1 = __require("fs");
	var path$1 = __require("path");
	var util = require_util();
	var SqliteError = require_sqlite_error();
	module.exports = function createDatabase(getAddon, allowNativeBinding) {
		function Database(filenameGiven, options) {
			if (new.target == null) return new Database(filenameGiven, options);
			let buffer;
			if (Buffer.isBuffer(filenameGiven)) {
				buffer = filenameGiven;
				filenameGiven = ":memory:";
			}
			if (filenameGiven == null) filenameGiven = "";
			if (options == null) options = {};
			if (typeof filenameGiven !== "string") throw new TypeError("Expected first argument to be a string");
			if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
			if ("readOnly" in options) throw new TypeError("Misspelled option \"readOnly\" should be \"readonly\"");
			if ("memory" in options) throw new TypeError("Option \"memory\" was removed in v7.0.0 (use \":memory:\" filename instead)");
			const filename = filenameGiven.trim();
			const anonymous = filename === "" || filename === ":memory:";
			const readonly = util.getBooleanOption(options, "readonly");
			const fileMustExist = util.getBooleanOption(options, "fileMustExist");
			const timeout = "timeout" in options ? options.timeout : 5e3;
			const verbose = "verbose" in options ? options.verbose : null;
			const nativeBinding = "nativeBinding" in options ? options.nativeBinding : null;
			if (readonly && anonymous && !buffer) throw new TypeError("In-memory/temporary databases cannot be readonly");
			if (!Number.isInteger(timeout) || timeout < 0) throw new TypeError("Expected the \"timeout\" option to be a positive integer");
			if (timeout > 2147483647) throw new RangeError("Option \"timeout\" cannot be greater than 2147483647");
			if (verbose != null && typeof verbose !== "function") throw new TypeError("Expected the \"verbose\" option to be a function");
			if (!allowNativeBinding && "nativeBinding" in options) throw new TypeError("The \"nativeBinding\" option is only supported by the default better-sqlite3 entrypoint");
			if (allowNativeBinding && nativeBinding != null && typeof nativeBinding !== "string" && typeof nativeBinding !== "object") throw new TypeError("Expected the \"nativeBinding\" option to be a string or addon object");
			const addon = getAddon(nativeBinding);
			if (!addon.isInitialized) {
				addon.initialize(SqliteError, arrayFactory, arrayAppender, rowFactory, recordFactory);
				addon.isInitialized = true;
			}
			if (!anonymous && !filename.startsWith("file:") && !fs$1.existsSync(path$1.dirname(filename))) throw new TypeError("Cannot open database because the directory does not exist");
			Object.defineProperties(this, {
				[util.cppdb]: { value: new addon.Database(filename, filenameGiven, anonymous, readonly, fileMustExist, timeout, verbose || null, buffer || null) },
				...wrappers.getters
			});
		}
		const wrappers = require_wrappers();
		Database.prototype.prepare = wrappers.prepare;
		Database.prototype.transaction = require_transaction();
		Database.prototype.pragma = require_pragma();
		Database.prototype.explain = require_explain();
		Database.prototype.backup = require_backup();
		Database.prototype.serialize = require_serialize();
		Database.prototype.function = require_function();
		Database.prototype.aggregate = require_aggregate();
		Database.prototype.table = require_table();
		Database.prototype.loadExtension = wrappers.loadExtension;
		Database.prototype.exec = wrappers.exec;
		Database.prototype.close = wrappers.close;
		Database.prototype.defaultSafeIntegers = wrappers.defaultSafeIntegers;
		Database.prototype.unsafeMode = wrappers.unsafeMode;
		Database.prototype[util.inspect] = require_inspect();
		return Database;
	};
	function arrayFactory(...values) {
		return values;
	}
	function arrayAppender(array, ...values) {
		const offset = array.length;
		for (let i = 0; i < values.length; ++i) array[offset + i] = values[i];
	}
	function rowFactory(...keys) {
		if (!keys.includes("__proto__")) {
			const parameters = keys.map((_, index) => `v${index}`).join(",");
			const properties = keys.map((key, index) => `${JSON.stringify(key)}:v${index}`).join(",");
			return Function(`return (${parameters}) => ({${properties}})`)();
		}
		return (...values) => {
			const row = {};
			for (let i = 0; i < keys.length; ++i) row[keys[i]] = values[i];
			return row;
		};
	}
	function recordFactory(value) {
		return {
			value,
			done: false
		};
	}
}));
//#endregion
//#region node_modules/better-sqlite3/lib/binding.js
var require_binding = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = __require("fs");
	var path = __require("path");
	var PREBUILD_PLATFORMS = [
		"linux",
		"darwin",
		"win32"
	];
	var PREBUILD_ARCHS = ["x64", "arm64"];
	var DEFAULT_ADDON;
	function getBinding(nativeBinding) {
		if (typeof nativeBinding === "string") return (typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : __require)(path.resolve(nativeBinding).replace(/(\.node)?$/, ".node"));
		if (typeof nativeBinding === "object" && nativeBinding !== null) return nativeBinding;
		if (DEFAULT_ADDON) return DEFAULT_ADDON;
		let filename = getPrebuildPath();
		if (filename) return DEFAULT_ADDON = __require(filename);
		filename = path.join(__dirname, "..", "build", "Debug", "better_sqlite3.node");
		if (!fs.existsSync(filename)) filename = path.join(__dirname, "..", "build", "Release", "better_sqlite3.node");
		return DEFAULT_ADDON = __require(filename);
	}
	function getPrebuildPath() {
		if (PREBUILD_PLATFORMS.includes(process.platform) && PREBUILD_ARCHS.includes(process.arch)) {
			const target = `${isLinuxMusl() ? "linuxmusl" : process.platform}-${process.arch}`;
			const filename = path.join(__dirname, "..", "prebuilds", `${target}.node`);
			if (fs.existsSync(filename)) return filename;
		}
		return null;
	}
	function isLinuxMusl() {
		return process.platform === "linux" && !process.report.getReport().header.glibcVersionRuntime;
	}
	exports.getBinding = getBinding;
	exports.getPrebuildPath = getPrebuildPath;
	if (__require.main === module) process.stdout.write(getPrebuildPath() ? "1" : "0");
}));
//#endregion
//#region src/main/modules/store/index.ts
var import_lib = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_database()(require_binding().getBinding, true);
	module.exports.SqliteError = require_sqlite_error();
})))(), 1);
var db;
function setupStore() {
	const userDataPath = app.getPath("userData");
	if (!existsSync(userDataPath)) mkdirSync(userDataPath, { recursive: true });
	const dbPath = join(userDataPath, "daily-notch.sqlite");
	db = new import_lib.default(dbPath);
	db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      estimatedMinutes INTEGER DEFAULT 25,
      date TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      completedAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity (
      date TEXT PRIMARY KEY,
      completedCount INTEGER DEFAULT 0
    );
  `);
	if (!db.prepare("SELECT value FROM settings WHERE key = ?").get("streak")) {
		db.prepare("INSERT INTO settings (key, value) VALUES ('streak', '0')").run();
		db.prepare("INSERT INTO settings (key, value) VALUES ('focusMinutes', '25')").run();
	}
	ipcMain.handle("store:getData", (_, date) => readData(date));
	ipcMain.handle("store:addTask", (_, task) => addTask(task));
	ipcMain.handle("store:toggleTask", (_, id) => toggleTask(id));
	ipcMain.handle("store:deleteTask", (_, id) => deleteTask(id));
}
function readData(targetDate) {
	if (!db) return {
		tasks: [],
		activity: [],
		focusMinutes: 25,
		streak: 0
	};
	const mappedTasks = db.prepare("SELECT * FROM tasks WHERE date = ? ORDER BY createdAt ASC").all(targetDate).map((t) => ({
		...t,
		completed: t.completed === 1
	}));
	const activity = db.prepare("SELECT date, completedCount FROM activity ORDER BY date DESC LIMIT 60").all();
	const streakRow = db.prepare("SELECT value FROM settings WHERE key = 'streak'").get();
	const focusRow = db.prepare("SELECT value FROM settings WHERE key = 'focusMinutes'").get();
	return {
		tasks: mappedTasks,
		activity,
		streak: streakRow ? parseInt(streakRow.value) : 0,
		focusMinutes: focusRow ? parseInt(focusRow.value) : 25
	};
}
function addTask(taskData) {
	const newTask = {
		...taskData,
		id: Math.random().toString(36).substring(2, 9),
		createdAt: Date.now()
	};
	db.prepare(`
    INSERT INTO tasks (id, title, completed, estimatedMinutes, date, createdAt)
    VALUES (@id, @title, @completed, @estimatedMinutes, @date, @createdAt)
  `).run({
		...newTask,
		completed: newTask.completed ? 1 : 0
	});
	return newTask;
}
function toggleTask(id) {
	const taskRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	if (!taskRow) return null;
	const isCompleted = !(taskRow.completed === 1);
	db.prepare("UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?").run(isCompleted ? 1 : 0, isCompleted ? Date.now() : null, id);
	const date = taskRow.date;
	if (isCompleted) db.prepare(`
      INSERT INTO activity (date, completedCount) VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET completedCount = completedCount + 1
    `).run(date);
	else db.prepare(`
      UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?
    `).run(date);
	const updatedRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	return {
		...updatedRow,
		completed: updatedRow.completed === 1
	};
}
function deleteTask(id) {
	const taskRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	if (!taskRow) return false;
	if (taskRow.completed === 1) db.prepare("UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?").run(taskRow.date);
	db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
	return true;
}
//#endregion
//#region src/main/modules/timer/index.ts
var interval = null;
var timeRemaining = 0;
var isRunning$1 = false;
function setupTimer() {
	ipcMain.handle("timer:start", (_, minutes) => startTimer(minutes));
	ipcMain.handle("timer:stop", () => stopTimer());
	ipcMain.handle("timer:status", () => ({
		isRunning: isRunning$1,
		timeRemaining
	}));
}
function startTimer(minutes) {
	if (isRunning$1) return;
	timeRemaining = minutes * 60;
	isRunning$1 = true;
	interval = setInterval(() => {
		if (timeRemaining > 0) {
			timeRemaining -= 1;
			broadcastTick();
		} else {
			stopTimer();
			showNotification("Focus Session Complete!", "Great job staying focused.");
		}
	}, 1e3);
}
function stopTimer() {
	if (interval) clearInterval(interval);
	interval = null;
	isRunning$1 = false;
	timeRemaining = 0;
	broadcastTick();
}
function broadcastTick() {
	BrowserWindow.getAllWindows().forEach((win) => {
		win.webContents.send("timer:tick", {
			isRunning: isRunning$1,
			timeRemaining
		});
	});
}
function showNotification(title, body) {
	if (Notification.isSupported()) new Notification({
		title,
		body
	}).show();
}
//#endregion
//#region src/main/modules/shortcuts/index.ts
var isRunning = false;
function setupShortcuts() {
	app.whenReady().then(() => {
		globalShortcut.register("CommandOrControl+Shift+Space", () => {
			if (isRunning) {
				stopTimer();
				isRunning = false;
			} else {
				startTimer(25);
				isRunning = true;
			}
		});
	});
}
function cleanupShortcuts() {
	globalShortcut.unregisterAll();
}
//#endregion
//#region src/main/index.ts
process.env.DIST_ELECTRON = join(import.meta.dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
var win = null;
function createWindow() {
	const { screen } = __require("electron");
	const { width } = screen.getPrimaryDisplay().workAreaSize;
	const windowWidth = 800;
	win = new BrowserWindow({
		width: windowWidth,
		height: 600,
		x: Math.floor(width / 2 - windowWidth / 2),
		y: 0,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		resizable: false,
		skipTaskbar: true,
		webPreferences: { preload: join(import.meta.dirname, "../preload/index.js") }
	});
	const devUrl = process.env.VITE_DEV_SERVER_URL;
	if (devUrl) win.loadURL(`${devUrl}src/renderer/index.html`);
	else win.loadFile(join(process.env.DIST || "", "src/renderer/index.html"));
}
app.whenReady().then(() => {
	setupStore();
	setupTimer();
	setupShortcuts();
	createWindow();
	setupTray();
});
app.on("window-all-closed", () => {
	cleanupShortcuts();
	if (process.platform !== "darwin") app.quit();
});
app.on("will-quit", () => {
	cleanupShortcuts();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
export {};
