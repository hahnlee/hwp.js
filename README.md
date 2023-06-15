# Development
## Build
```
yarn workspaces list
yarn workspace @nadooio/hwpjs-website build
```
## Packaging
!!! Pre-requisite: configute your aws profile test.nadoo.io/ap-northeast-1 !!!
```
aws codeartifact login --tool npm --repository packages --domain nadooio-npm --domain-owner 867205542541 --region ap-northeast-1 --profile test.nadoo.io/ap-northeast-1
npm publish
```

# Credits
A huge thanks to
- [hwplib](https://github.com/neolord0/hwplib)
- [cfb-js](https://github.com/SheetJS/js-cfb)
- [pako](https://github.com/nodeca/pako)
- [pdf.js](https://github.com/mozilla/pdf.js)
- [print-elements](https://github.com/szepeshazi/print-elements)

# Contributors
<a href="https://github.com/hahnlee/hwp.js/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=hahnlee/hwp.js" />
</a>

# License
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
