import { assertEquals } from "../deps.ts";
import cheetah from '../../mod.ts'
import { firewall } from "../../ext/firewall.ts";

Deno.test("ext/firewall", async (t) => {
  await t.step("vpn", async (t) => {
    const app = new cheetah({debug: true});

    app.use(firewall({
      blockVPN: true,
    }));
  
    const res = await app.fetch(new Request("http://localhost", {
      headers: {
        "cf-connecting-ip": "2.56.16.0",
      },
    }));
  
    assertEquals(res.status, 403);
  })
})


Deno.test("datacenters", async () => {
  const app = new cheetah({debug: true});

  app.use(firewall({
    blockDatacenter: true,
  }));

  const res = await app.fetch(new Request("http://localhost", {
    headers: {
      "cf-connecting-ip": "1.12.32.0",
    },
  }));

  assertEquals(res.status, 403);
});

Deno.test("customRange", async () => {
  const app = new cheetah({debug: true});

  app.use(firewall({
    customRange: [
      '1.2.3.4/32',
    ],
  }));

  const res = await app.fetch(new Request("http://localhost", {
    headers: {
      "cf-connecting-ip": "1.2.3.4",
    },
  }));

  assertEquals(res.status, 403);
});

Deno.test("customLists", async () => {
  const app = new cheetah({debug: true});

  app.use(firewall({
    customLists: ['https://gist.githubusercontent.com/not-ivy/bfdb8483df177b2415fdae8b58884029/raw/44b651679b22448375b762d058962173fa205ba4/ipv4ver1.txt', 'https://gist.githubusercontent.com/not-ivy/bfdb8483df177b2415fdae8b58884029/raw/44b651679b22448375b762d058962173fa205ba4/ipv4ver2.txt'],
  }));

  const res1 = await app.fetch(new Request("http://localhost", {
    headers: {
      "cf-connecting-ip": "210.43.83.54",
    },
  }));
  const res2 = await app.fetch(new Request("http://localhost", {
    headers: {
      "cf-connecting-ip": "47.240.42.225",
    },
  }));

  assertEquals(res1.status, 403);
  assertEquals(res2.status, 403);
});