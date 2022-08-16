// node_modules/svelte/internal/index.mjs
function noop() {
}
function is_promise(value) {
  return value && typeof value === "object" && typeof value.then === "function";
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
var is_hydrating = false;
function start_hydrating() {
  is_hydrating = true;
}
function end_hydrating() {
  is_hydrating = false;
}
function append(target, node) {
  target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
  const append_styles_to = get_root_for_style(target);
  if (!append_styles_to.getElementById(style_sheet_id)) {
    const style = element("style");
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
}
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
function append_stylesheet(node, style) {
  append(node.head || node, style);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
var seen_callbacks = /* @__PURE__ */ new Set();
var flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var outroing = /* @__PURE__ */ new Set();
var outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
function handle_promise(promise, info) {
  const token = info.token = {};
  function update2(type, index, key, value) {
    if (info.token !== token)
      return;
    info.resolved = value;
    let child_ctx = info.ctx;
    if (key !== void 0) {
      child_ctx = child_ctx.slice();
      child_ctx[key] = value;
    }
    const block = type && (info.current = type)(child_ctx);
    let needs_flush = false;
    if (info.block) {
      if (info.blocks) {
        info.blocks.forEach((block2, i) => {
          if (i !== index && block2) {
            group_outros();
            transition_out(block2, 1, 1, () => {
              if (info.blocks[i] === block2) {
                info.blocks[i] = null;
              }
            });
            check_outros();
          }
        });
      } else {
        info.block.d(1);
      }
      block.c();
      transition_in(block, 1);
      block.m(info.mount(), info.anchor);
      needs_flush = true;
    }
    info.block = block;
    if (info.blocks)
      info.blocks[index] = block;
    if (needs_flush) {
      flush();
    }
  }
  if (is_promise(promise)) {
    const current_component2 = get_current_component();
    promise.then((value) => {
      set_current_component(current_component2);
      update2(info.then, 1, info.value, value);
      set_current_component(null);
    }, (error) => {
      set_current_component(current_component2);
      update2(info.catch, 2, info.error, error);
      set_current_component(null);
      if (!info.hasCatch) {
        throw error;
      }
    });
    if (info.current !== info.pending) {
      update2(info.pending, 0);
      return true;
    }
  } else {
    if (info.current !== info.then) {
      update2(info.then, 1, info.value, promise);
      return true;
    }
    info.resolved = promise;
  }
}
function update_await_block_branch(info, ctx, dirty) {
  const child_ctx = ctx.slice();
  const { resolved } = info;
  if (info.current === info.then) {
    child_ctx[info.value] = resolved;
  }
  if (info.current === info.catch) {
    child_ctx[info.error] = resolved;
  }
  info.block.p(child_ctx, dirty);
}
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles2, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles2 && append_styles2($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      start_hydrating();
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    end_hydrating();
    flush();
  }
  set_current_component(parent_component);
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr2, _oldValue, newValue) {
      this[attr2] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}
var SvelteComponent = class {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
};

// src/lib/stamps.js
import Arweave from "https://cdn.skypack.dev/arweave";
import { WarpWebFactory, LoggerFactory } from "https://unpkg.com/warp-contracts@1.1.14/bundles/esm.bundle.js";
var STAMPCOIN = "9nDWI3eHrMQbrfs9j8_YPfLbYJmBodgn7cBCG8bii4o";
var CACHE = "https://stamp-cache.onrender.com";
var host = `${window.location.host.split(".").reverse()[1] || ""}.${window.location.host.split(".").reverse()[0] || "localhost"}`;
if (["gitpod.io", "localhost"].includes(host)) {
  host = "arweave.net";
}
var arweave = Arweave.init({
  host,
  port: 443,
  protocol: "https"
});
LoggerFactory.INST.logLevel("fatal");
var warp = WarpWebFactory.memCached(arweave);
var getCount = (txId) => fetch(CACHE).then((res) => res.ok ? res.json() : Promise.reject(new Error(res.status))).catch(() => readState()).then((state) => Object.values(state.stamps).filter((s) => s.asset === txId)).then((stamps) => stamps.length);
var stamp = (txId, addr) => {
  return isVouched(addr).then(
    (_) => warp.contract(STAMPCOIN).connect("use_wallet").bundleInteraction({
      function: "stamp",
      asset: txId,
      timestamp: Date.now()
    })
  );
};
function readState() {
  return warp.contract(STAMPCOIN).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true
  }).readState();
}
function isVouched(addr) {
  return arweave.api.post("graphql", {
    query: `
query {
  transactions(tags: { name: "Vouch-For", values: ["${addr}"]}) {
    edges {
      node {
        id
      }
    }
  }
}
  `
  }).then((result) => {
    var _a, _b, _c;
    return ((_c = (_b = (_a = result == null ? void 0 : result.data) == null ? void 0 : _a.data) == null ? void 0 : _b.transactions) == null ? void 0 : _c.edges) || [];
  }).then((edges) => edges.length > 0 ? true : Promise.reject(new Error("is not vouched!")));
}

// src/Widget.svelte
function add_css(target) {
  append_styles(target, "svelte-1xkhbrx", '.card.svelte-1xkhbrx.svelte-1xkhbrx{font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,\n      "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,\n      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",\n      "Noto Color Emoji";height:250px;width:200px;background-color:rebeccapurple;color:white;display:flex;flex-direction:column;border-radius:8px;margin-top:8px;align-items:center}.card-title.svelte-1xkhbrx.svelte-1xkhbrx{font-size:2em;margin-top:16px}.card-body.svelte-1xkhbrx.svelte-1xkhbrx{font-size:3em;margin-top:16px;margin-bottom:16px}.card-buttons.svelte-1xkhbrx.svelte-1xkhbrx{display:flex;flex-direction:column}.btn.svelte-1xkhbrx.svelte-1xkhbrx{display:inline-flex;flex-wrap:wrap;flex-shrink:0;background-color:black;color:white;border-radius:8px;padding:4px 12px;cursor:pointer;border-color:rebeccapurple;height:32px;align-items:center;justify-content:center;margin-top:8px;font-weight:600}.container.svelte-1xkhbrx.svelte-1xkhbrx{font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,\n      "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,\n      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",\n      "Noto Color Emoji";border:2px solid;border-radius:8px;display:flex;width:200px;align-items:center;justify-items:center;height:24px}div.svelte-1xkhbrx #heading1.svelte-1xkhbrx{margin:0px;height:100%;flex:1 1 auto;background-color:rebeccapurple;color:white;text-align:center}div.svelte-1xkhbrx #count.svelte-1xkhbrx{flex:1 1 auto;text-align:center;font-weight:700}');
}
function create_catch_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block(ctx) {
  let div2;
  let div0;
  let t1;
  let div1;
  let t2_value = ctx[7] + "";
  let t2;
  let t3;
  let if_block_anchor;
  let mounted;
  let dispose;
  let if_block = ctx[0] && create_if_block(ctx);
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      div0.textContent = "stamps";
      t1 = space();
      div1 = element("div");
      t2 = text(t2_value);
      t3 = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      attr(div0, "id", "heading1");
      attr(div0, "class", "svelte-1xkhbrx");
      attr(div1, "id", "count");
      attr(div1, "class", "svelte-1xkhbrx");
      attr(div2, "class", "container svelte-1xkhbrx");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div2, t1);
      append(div2, div1);
      append(div1, t2);
      insert(target, t3, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      if (!mounted) {
        dispose = listen(div2, "click", ctx[2]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t2_value !== (t2_value = ctx2[7] + ""))
        set_data(t2, t2_value);
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching)
        detach(div2);
      if (detaching)
        detach(t3);
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block(ctx) {
  let div3;
  let div0;
  let t1;
  let div1;
  let t2_value = ctx[7] + "";
  let t2;
  let t3;
  let div2;
  let button0;
  let t5;
  let button1;
  let mounted;
  let dispose;
  return {
    c() {
      div3 = element("div");
      div0 = element("div");
      div0.textContent = "Stamps";
      t1 = space();
      div1 = element("div");
      t2 = text(t2_value);
      t3 = space();
      div2 = element("div");
      button0 = element("button");
      button0.textContent = "STAMP";
      t5 = space();
      button1 = element("button");
      button1.textContent = "LEARN MORE";
      attr(div0, "class", "card-title svelte-1xkhbrx");
      attr(div1, "class", "card-body svelte-1xkhbrx");
      attr(button0, "class", "btn svelte-1xkhbrx");
      attr(button1, "class", "btn svelte-1xkhbrx");
      attr(div2, "class", "card-buttons svelte-1xkhbrx");
      attr(div3, "class", "card svelte-1xkhbrx");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div0);
      append(div3, t1);
      append(div3, div1);
      append(div1, t2);
      append(div3, t3);
      append(div3, div2);
      append(div2, button0);
      append(div2, t5);
      append(div2, button1);
      if (!mounted) {
        dispose = listen(button0, "click", ctx[3]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t2_value !== (t2_value = ctx2[7] + ""))
        set_data(t2, t2_value);
    },
    d(detaching) {
      if (detaching)
        detach(div3);
      mounted = false;
      dispose();
    }
  };
}
function create_pending_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_fragment(ctx) {
  let await_block_anchor;
  let promise;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: false,
    pending: create_pending_block,
    then: create_then_block,
    catch: create_catch_block,
    value: 7
  };
  handle_promise(promise = ctx[1], info);
  return {
    c() {
      await_block_anchor = empty();
      info.block.c();
    },
    m(target, anchor) {
      insert(target, await_block_anchor, anchor);
      info.block.m(target, info.anchor = anchor);
      info.mount = () => await_block_anchor.parentNode;
      info.anchor = await_block_anchor;
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      info.ctx = ctx;
      if (dirty & 2 && promise !== (promise = ctx[1]) && handle_promise(promise, info)) {
      } else {
        update_await_block_branch(info, ctx, dirty);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(await_block_anchor);
      info.block.d(detaching);
      info.token = null;
      info = null;
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { contract } = $$props;
  let { address } = $$props;
  let { assetCode } = $$props;
  let cardVisible = false;
  function toggleCard() {
    $$invalidate(0, cardVisible = !cardVisible);
  }
  async function doStamp() {
    $$invalidate(1, stampCount = await stamp(contract).then(() => getCount(contract)));
  }
  let stampCount = getCount(contract);
  $$self.$$set = ($$props2) => {
    if ("contract" in $$props2)
      $$invalidate(4, contract = $$props2.contract);
    if ("address" in $$props2)
      $$invalidate(5, address = $$props2.address);
    if ("assetCode" in $$props2)
      $$invalidate(6, assetCode = $$props2.assetCode);
  };
  return [cardVisible, stampCount, toggleCard, doStamp, contract, address, assetCode];
}
var Widget = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { contract: 4, address: 5, assetCode: 6 }, add_css);
  }
};
var Widget_default = Widget;

// src/main.js
try {
  const el = document.getElementById("stamp-widget");
  const address = document.querySelector('meta[name="hypar-author"]').content;
  const assetCode = document.querySelector('meta[name="hypar-asset-code"]').content;
  const dataset = Object.assign({}, el.dataset, { address, assetCode });
  new Widget_default({
    target: el,
    props: dataset
  });
} catch (e) {
  console.log("Could not initialize widget");
  console.log(e.message);
}
