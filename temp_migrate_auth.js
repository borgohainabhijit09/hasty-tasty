const fs = require('fs');
const path = require('path');

const files = [
  "apps/web/src/app/(storefront)/checkout/page.tsx",
  "apps/web/src/app/(storefront)/b2b/page.tsx",
  "apps/web/src/app/(storefront)/account/layout.tsx",
  "apps/web/src/app/(storefront)/account/page.tsx",
  "apps/web/src/app/(storefront)/account/details/page.tsx",
  "apps/web/src/app/(storefront)/account/addresses/page.tsx",
  "apps/web/src/app/admin/(dashboard)/layout.tsx",
  "apps/web/src/app/(storefront)/account/orders/page.tsx",
  "apps/web/src/app/admin/(dashboard)/shipping/page.tsx",
  "apps/web/src/app/admin/(dashboard)/b2b-requests/actions.ts",
  "apps/web/src/app/admin/(dashboard)/b2b-requests/page.tsx",
  "apps/web/src/app/admin/(dashboard)/actions.ts",
];

for (const f of files) {
  const fullPath = path.join(__dirname, f);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace imports
  content = content.replace(/import \{ createClient \} from ['"]@\/utils\/supabase\/server['"];?/g, 'import { auth } from "@/auth";');
  
  // Replace instantiation
  content = content.replace(/const supabase = await createClient\(\);?/g, 'const session = await auth();');
  content = content.replace(/const supabase = createClient\(\);?/g, 'const session = await auth();');
  
  // Replace getUser() call
  content = content.replace(/const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);?/g, 'const user = session?.user;');
  content = content.replace(/const \{ data, error \} = await supabase\.auth\.getUser\(\);?/g, 'const user = session?.user; const error = !user ? "Not logged in" : null;');
  
  // Replace auth checks
  content = content.replace(/if \(!user\) \{/g, 'if (!user) {');
  
  // Write back
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${f}`);
}
