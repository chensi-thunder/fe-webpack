const shell = require("shelljs");
const htmlWebpackPlugin = require("html-webpack-plugin");
const PLUGIN_NAME = "fe-project-base-info-plugin";
let pkgJson;

class FeProjectBaseInfoPlugin {
  // constructor () {}

  apply(compiler) {
    // 是否安装
    if (!shell.which("git")) {
      shell.echo(`${PLUGIN_NAME} 插件需要 git`);
      return;
    }
    // 当前路径是否为git仓库路径
    if (this._parseStdout("git rev-parse --is-inside-work-tree") !== "true") {
      shell.echo(
        `${PLUGIN_NAME} 插件通过 git 命令获取版本信息，当前路径为非 git 仓库路径`
      );
      return;
    }

    // 获取 packageJson
    pkgJson = require("safe-require")(
      `${compiler.options.context}/package.json`
    );

    // HtmlWebpackPlugin version 4.0.0
    if (htmlWebpackPlugin.getHooks) {
      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
        // compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
        htmlWebpackPlugin
          .getHooks(compilation)
          .beforeEmit.tapAsync(PLUGIN_NAME, this.onBeforeEmit.bind(this));
      });
    } else {
      // HtmlWebpackPlugin version 3.2.0
      compiler.plugin("compilation", (compilation) => {
        compilation.plugin(
          "html-webpack-plugin-after-html-processing",
          this.onBeforeEmit.bind(this)
        );
      });
    }
  }

  onBeforeEmit(data, cb = null) {
    let html = data.html;

    const projectBaseInfo = {
      /* https://x.x.x.x/gdt/demo.git => demo */
      name: this._parseStdout("git config --get remote.origin.url").match(
        /.*\/(.*)\.git$/
      )[1], // git rev-parse --show-toplevel
      version: (pkgJson || {}).version,
      /* remotes/origin/master-fujian-develop => master-fujian-develop */
      branch: this._parseStdout(
        "git name-rev --name-only HEAD | sed -e 's,.*/(.*)$,${'1'},'"
      ),
      commitId: this._parseStdout("git rev-parse HEAD"), // git log --abbrev-commit --pretty=oneline -1 | cut -c 1-7
      packTime: new Date().toLocaleString(),
    };

    html = html.replace(
      "</body>",
      `<script type="text/javascript">window.fe = ${JSON.stringify(
        projectBaseInfo
      )}</script></body>`
    );

    data.html = html;

    if (cb) {
      cb(null, data);
    }
  }

  _parseStdout(command) {
    let res = shell.exec(command, { silent: true }).stdout;
    if (res.endsWith("\n")) {
      res = res.substring(0, res.length - 1);
    }
    return res;
  }
}

// 导出 Plugin
module.exports = FeProjectBaseInfoPlugin;
