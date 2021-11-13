"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[9421],{3905:function(e,t,r){r.d(t,{Zo:function(){return m},kt:function(){return c}});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),p=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},m=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},h=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),h=p(r),c=a,d=h["".concat(s,".").concat(c)]||h[c]||u[c]||o;return r?n.createElement(d,i(i({ref:t},m),{},{components:r})):n.createElement(d,i({ref:t},m))}));function c(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=h;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var p=2;p<o;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}h.displayName="MDXCreateElement"},6646:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return l},contentTitle:function(){return s},metadata:function(){return p},assets:function(){return m},toc:function(){return u},default:function(){return c}});var n=r(3117),a=r(102),o=(r(7294),r(3905)),i=["components"],l={title:"Betterer v5.0.0 \u2600\ufe0f",author:"Craig Spence",authorURL:"http://twitter.com/phenomnominal",authorTwitter:"phenomnominal"},s=void 0,p={permalink:"/betterer/blog/2021/11/13/betterer-v5.0.0",editUrl:"https://github.com/phenomnomnominal/betterer/edit/master/website/blog/blog/2021-11-13-betterer-v5.0.0.md",source:"@site/blog/2021-11-13-betterer-v5.0.0.md",title:"Betterer v5.0.0 \u2600\ufe0f",description:"Oof, this one feels like it's been a while coming, but after a whole bunch of work, and a whole bunch of breaking changes I've just released v5.0.0 of Betterer! \ud83c\udf89",date:"2021-11-13T00:00:00.000Z",formattedDate:"November 13, 2021",tags:[],readingTime:6.04,truncated:!1,authors:[{name:"Craig Spence",url:"http://twitter.com/phenomnominal"}],nextItem:{title:"Incrementally adding Stylelint rules with Betterer \u2600\ufe0f",permalink:"/betterer/blog/2021/03/01/betterer-and-stylelint"}},m={authorsImageUrls:[void 0]},u=[{value:"What is <strong>Betterer</strong>?",id:"what-is-betterer",children:[],level:2},{value:"What happened to v2, v3, v4...?",id:"what-happened-to-v2-v3-v4",children:[],level:2},{value:"What&#39;s in v5.0.0?",id:"whats-in-v500",children:[{value:"Parallel tests:",id:"parallel-tests",children:[{value:"Before:",id:"before",children:[],level:4},{value:"After:",id:"after",children:[],level:4}],level:3},{value:"<strong>Betterer</strong> \u2764\ufe0f <strong>Angular</strong>:",id:"betterer-\ufe0f-angular",children:[],level:3},{value:"Simpler <code>BettererFileTest</code>:",id:"simpler-bettererfiletest",children:[{value:"Before:",id:"before-1",children:[],level:4},{value:"After:",id:"after-1",children:[],level:4}],level:3},{value:"Improved workflow:",id:"improved-workflow",children:[],level:3},{value:"Improved caching:",id:"improved-caching",children:[],level:3},{value:"Bug fixes and improvements:",id:"bug-fixes-and-improvements",children:[],level:3}],level:2},{value:"Thanks \u2764\ufe0f",id:"thanks-\ufe0f",children:[],level:2}],h={toc:u};function c(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},h,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Oof, this one feels like it's been a while coming, but after a whole bunch of work, and a whole bunch of breaking changes ",(0,o.kt)("strong",{parentName:"p"},"I've just released")," ",(0,o.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@betterer/cli"},(0,o.kt)("strong",{parentName:"a"},"v5.0.0"))," ",(0,o.kt)("strong",{parentName:"p"},"of")," ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/"},(0,o.kt)("strong",{parentName:"a"},"Betterer!"))," \ud83c\udf89"),(0,o.kt)("h2",{id:"what-is-betterer"},"What is ",(0,o.kt)("strong",{parentName:"h2"},"Betterer"),"?"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/"},(0,o.kt)("strong",{parentName:"a"},"Betterer"))," is a test runner that helps make incremental improvements to your code!"),(0,o.kt)("p",null,"The first time ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," it runs a test, it will take a snapshot of the current state. From that point on, whenever it runs it will compare against that snapshot. It will either throw an error (if the test got worse \u274c), or update the snapshot (if the test got better \u2705). That's pretty much it!"),(0,o.kt)("p",null,"You can check out the (newly updated!) documentation at ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/"},"https://phenomnomnominal.github.io/betterer/")),(0,o.kt)("h2",{id:"what-happened-to-v2-v3-v4"},"What happened to v2, v3, v4...?"),(0,o.kt)("p",null,'"But Craig", I hear you say, "The ',(0,o.kt)("a",{parentName:"p",href:"https://dev.to/phenomnominal/betterer-v1-0-0-301b"},"last time you posted about ",(0,o.kt)("strong",{parentName:"a"},"Betterer")),", it was at v1.0.0!? What's been going on?!\". \ud83d\udd25\ud83d\udd25\ud83d\udd25"),(0,o.kt)("p",null,"That's very astute of you dear reader, and let's just put it this way - I sure do love breaking APIs! One of the interesting things about ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," is that it is a tool designed for problems that emerge in large and old codebases. That means it has to be able to handle large and old codebases from the get go! So I've had a lot of fun as I've tried to figure out the best workflows and APIs for using ",(0,o.kt)("strong",{parentName:"p"},"Betterer"),"."),(0,o.kt)("p",null,"Between v1.0.0 and now, I've released a bunch of features, consolidated and simplified APIs, and just generally made ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," more usable and flexible. I'm pretty happy with where it is at now, so I figured it was about time for an update. I've even been talking about it at a few conferences now that they're coming back! What a world \ud83c\udf0d!"),(0,o.kt)("h2",{id:"whats-in-v500"},"What's in v5.0.0?"),(0,o.kt)("h3",{id:"parallel-tests"},"Parallel tests:"),(0,o.kt)("p",null,"Performance is hard. Prior to v5, the default ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," reporter would struggle pretty badly, especially when lots of tests were running and producing lots of issues. That was because the main thread was responsible for updating the reporter output ",(0,o.kt)("em",{parentName:"p"},"and")," running all the tests."),(0,o.kt)("p",null,"To fix this, ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," will now execute all your tests using ",(0,o.kt)("a",{parentName:"p",href:"https://nodejs.org/api/worker_threads.html"},"Node.js Worker Threads"),"! That frees up the main thread to focus on rendering and also means that multiple tests can run at the same time. Getting this to work required breaking some APIs, so your ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/docs/test-definition-file"},"test definition file")," needs to change:"),(0,o.kt)("h4",{id:"before"},"Before:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"// .betterer.ts\nimport { BettererTest } from '@betterer/betterer';\n\nexport default {\n  'my test': new BettererTest({\n    // ... test config\n  }),\n  'my other test': new BettererTest({\n    // ... test config\n  })\n};\n")),(0,o.kt)("h4",{id:"after"},"After:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"// .betterer.ts\nimport { BettererTest } from '@betterer/betterer';\n\nexport default {\n  'my test': () =>\n    new BettererTest({\n      // ... test config\n    }),\n  'my other test': () =>\n    new BettererTest({\n      // ... test config\n    })\n};\n")),(0,o.kt)("p",null,"But never fear, you can use the ",(0,o.kt)("inlineCode",{parentName:"p"},"betterer upgrade")," command to do this migration for you! Just running ",(0,o.kt)("inlineCode",{parentName:"p"},"betterer upgrade")," will show you what the migration will look like, and ",(0,o.kt)("inlineCode",{parentName:"p"},"betterer upgrade --save")," will actually update your files. Easy \u2728. The ",(0,o.kt)("inlineCode",{parentName:"p"},"betterer upgrade")," command will be used in the future when I (most probably) break more stuff."),(0,o.kt)("p",null,"Check out the ",(0,o.kt)("strong",{parentName:"p"},"beast")," of a PR ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/phenomnomnominal/betterer/pull/815"},"here")," (and yes, it took me three branches to get it right \ud83d\ude05)"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"betterer-\ufe0f-angular"},(0,o.kt)("strong",{parentName:"h3"},"Betterer")," \u2764\ufe0f ",(0,o.kt)("strong",{parentName:"h3"},"Angular"),":"),(0,o.kt)("p",null,"I've published a new ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," test for incrementally adding ",(0,o.kt)("a",{parentName:"p",href:"https://angular.io/guide/angular-compiler-options"},(0,o.kt)("strong",{parentName:"a"},"Angular")," compiler configuration")," to a project! I'm pretty excited by this, as there are a lot of ",(0,o.kt)("em",{parentName:"p"},"big")," Angular codebases out there that don't utilise the full power of the Angular compiler. In particular, I think ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," could be a good way to introduce the ",(0,o.kt)("a",{parentName:"p",href:"https://angular.io/guide/template-typecheck#strict-mode"},(0,o.kt)("inlineCode",{parentName:"a"},"strictTemplates"))," option. You can now do that with the following:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"//.betterer.ts\nimport { angular } from '@betterer/angular';\n\nexport default {\n  'strict templates': () =>\n    angular('./tsconfig.json', {\n      strictTemplates: true\n    }).include('./src/**/*.ts', './src/**/*.html')\n};\n")),(0,o.kt)("p",null,"Expect to see a full post detailing this in the near future!"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"simpler-bettererfiletest"},"Simpler ",(0,o.kt)("inlineCode",{parentName:"h3"},"BettererFileTest"),":"),(0,o.kt)("p",null,"The old ",(0,o.kt)("inlineCode",{parentName:"p"},"BettererFileTest")," API was a bit clunky and confusing due to the ",(0,o.kt)("inlineCode",{parentName:"p"},"BettererFileResolver")," thing. I've hidden that away in the internals, so now the public API is less clunky and confusing:"),(0,o.kt)("h4",{id:"before-1"},"Before:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { BettererFileResolver, BettererFileTest } from '@betterer/betterer';\n\nfunction myFileTest() {\n  const resolver = new BettererFileResolver();\n  return new BettererFileTest(resolver, async (filePaths, fileTestResult) => {\n    // test implementation...\n  });\n}\n")),(0,o.kt)("h4",{id:"after-1"},"After:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { BettererFileTest } from '@betterer/betterer';\n\nfunction myFileTest() {\n  return new BettererFileTest(async (filePaths, fileTestResult, resolver) => {\n    // test implementation...\n  });\n}\n")),(0,o.kt)("p",null,"Smaller public API, less magic, and you only have to use it if you know why, choice! \ud83d\udc4d"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"improved-workflow"},"Improved workflow:"),(0,o.kt)("p",null,"I'm still working on figuring out the ideal ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," workflow. For now, I recommend running ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," in ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/docs/running-betterer#pre-commit-mode"},"Pre-commit mode")," as a pre-commit hook (perhaps using ",(0,o.kt)("a",{parentName:"p",href:"https://typicode.github.io/husky"},"husky")," and ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/okonet/lint-staged"},"lint-staged"),") and in ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/docs/running-betterer#ci-mode"},"CI mode")," on your build server."),(0,o.kt)("p",null,"But one thing about ",(0,o.kt)("strong",{parentName:"p"},"chonky")," codebases is that they often have ",(0,o.kt)("em",{parentName:"p"},"lots")," of contributors! Lots of contributors making changes (and making things better) means that \ud83d\udc7b ",(0,o.kt)("em",{parentName:"p"},"merge")," ",(0,o.kt)("em",{parentName:"p"},"conflicts")," \ud83d\udc7b in the ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/docs/results-file"},"results file")," are quite common!"),(0,o.kt)("p",null,"To try to help with resolving merge conflicts, I've introduced the ",(0,o.kt)("inlineCode",{parentName:"p"},"betterer merge")," command. You can still fix merge conflicts manually, but ",(0,o.kt)("inlineCode",{parentName:"p"},"betterer merge")," will do it for you! If you're as lazy as me, you can even enable ",(0,o.kt)("inlineCode",{parentName:"p"},"automerge")," and you'll never have to think about merging the results file ever again (I hope, this could still be buggy \ud83d\udc1b\ud83d\ude05."),(0,o.kt)("p",null,"To enable automerge run:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"betterer init --automerge\n")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"improved-caching"},"Improved caching:"),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Betterer")," got some cool (ish) ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/docs/cache"},"caching")," implemented in v4, but turns out caching is a hard problem (\ud83d\ude05), so it's ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/phenomnomnominal/betterer/pull/712"},"taken")," ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/phenomnomnominal/betterer/pull/746/files"},"a")," ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/phenomnomnominal/betterer/pull/819/files"},"little")," bit to get right."),(0,o.kt)("p",null,"It works by passing the ",(0,o.kt)("inlineCode",{parentName:"p"},"--cache")," flag when running ",(0,o.kt)("strong",{parentName:"p"},"Betterer"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"betterer --cache\n")),(0,o.kt)("p",null,"That will create a file something like this:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "version": 2,\n  "testCache": {\n    "no hack comments": {\n      "packages/angular/src/angular.ts": "b66de728222febdecb3cf11d3aa510b3a8a6ae0e37c0539e37787964573a56ad1b7eb6ee378a9087",\n      "packages/angular/src/index.ts": "b66de728222febdecb3cf11d3aa510b3a8a6ae0eb9494122f82a750085fc20d2c3b0f14b34897431",\n      "packages/betterer/src/betterer.ts": "b66de728222febdecb3cf11d3aa510b3a8a6ae0e94efcd2f99a4cf14222c400693335ac1b94696bb"\n      // ...\n    }\n  }\n}\n')),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Betterer")," will use this cache to only re-test files that have actually changes, so it can be ",(0,o.kt)("em",{parentName:"p"},"much")," faster (useful for running on ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/docs/running-betterer#pre-commit-mode"},"pre-commit"),"!) I suspect there are still issues here, so please try it out and create issues. \ud83d\ude4c"),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"bug-fixes-and-improvements"},"Bug fixes and improvements:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/phenomnomnominal/betterer/pull/828/files"},(0,o.kt)("inlineCode",{parentName:"a"},"betterer results"))," command to get a quick summary:")),(0,o.kt)("p",null,(0,o.kt)("img",{parentName:"p",src:"https://dev-to-uploads.s3.amazonaws.com/uploads/articles/tvzavtxwithpzxge39ut.png",alt:"An example of Betterer's results summary output"})),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("a",{parentName:"p",href:"https://github.com/phenomnomnominal/betterer/issues/831"},"Negative filters"),". I already suspect I'll regret this, but you can now use ",(0,o.kt)("inlineCode",{parentName:"p"},'"!"')," at the start of a filter to negate it. Now ",(0,o.kt)("inlineCode",{parentName:"p"},"--filter myTest")," will just run ",(0,o.kt)("inlineCode",{parentName:"p"},'"myTest"'),", and ",(0,o.kt)("inlineCode",{parentName:"p"},"--filter !myTest")," will run every other test.")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"Rewrote most of the ",(0,o.kt)("a",{parentName:"p",href:"https://phenomnomnominal.github.io/betterer/docs/index"},"public API docs"),". These are now generated from the code, so should ",(0,o.kt)("em",{parentName:"p"},"hopefully")," be easier to keep up to date. \ud83e\udd1e")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"Removed a bunch of stuff from the public API. This means more consistency, and I'll be less likely to accidentally break stuff in the future. \ud83d\ude07"))),(0,o.kt)("hr",null),(0,o.kt)("h2",{id:"thanks-\ufe0f"},"Thanks \u2764\ufe0f"),(0,o.kt)("p",null,"Huge thanks to everyone who has helped me with this stuff, if you've read my ",(0,o.kt)("a",{parentName:"p",href:"https://twitter.com/phenomnominal/status/1453511720098541569"},"rambling, cryptic tweets"),", opened ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/phenomnomnominal/betterer"},"issues on Github"),", chatted to me about ",(0,o.kt)("strong",{parentName:"p"},"Betterer")," at conferences, it's all meant a lot! Maybe I'll print some stickers or something? \u2600\ufe0f"),(0,o.kt)("p",null,"Love \ud83e\udd70 this? Hate \ud83e\udd2c this? Go off in the comments, DM me on Twitter, or be the ",(0,o.kt)("strong",{parentName:"p"},"third")," person to join the ",(0,o.kt)("a",{parentName:"p",href:"https://discord.com/invite/YNgtXt6QVX"},(0,o.kt)("strong",{parentName:"a"},"Betterer")," Discord"),". Catch you on the line \ud83d\udcbb!"))}c.isMDXComponent=!0}}]);