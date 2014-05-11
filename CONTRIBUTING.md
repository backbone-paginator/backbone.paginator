Bug Report
==========

If you are submitting a bug report against a stable release, please check
whether you have the latest release and your bug has been fixed in one of the
newer versions. If it has been fixed, download the latest version and come back
if the issue persists.

You should open a new issue ticket only if the issue has not been reported
before. Please search the issue list, including all the closed bugs before you
submit a new issue ticket. If the issue has been reported before, you should
reopen the old one.

When reporting a new issue, you should use a succinct and concise subject
line. In the body, you should write down the precise steps to reproduce the
issues, and the browser vendor and version you are using.

Basic Email etiquette applies.

Feature Request
===============

Please search the issue list first to see if your feature has already been
requested. All features are tagged with the tag `enhancement`. If there already
is an enchancement ticket, you can vote on it by putting in a +/-1 comment. If
you cannot find the `enhancement` you are looking for, you can open a new issue.

Please prefix the subject line with **[Feature Request]** so your issue will
stand out as a feature request. In the body, please lay out your rationale for
such new feature to aid decision making.

Basic Email etiquette is appreciated.

Building
========

Backbone-pageable uses [grunt](http://gruntjs.com), [uglifyjs](https://github.com/mishoo/UglifyJS2)
and [JSDuck](https://github.com/senchalabs/jsduck).

### Note:

You need to install [ruby](http://www.ruby-lang.org/en/downloads/),
[JSDuck](https://github.com/senchalabs/jsduck/wiki/Installation),
[node.js and npm](http://nodejs.org) and then:

```shell
$ cd backbone.paginator
$ npm install
```

Once you have everything installed, you can do this to trigger a distribution
build:

```shell
$ cd backbone.paginator
$ grunt
```

You can check available tasks with:

```shell
$ grunt --help
```

Code Style
==========

Please be aware that this project uses 2 spaces for indentation. This project
has a [.jshintrc](.jshintrc) file defined, which is handy if you use
[jshint](http://www.jshint.com). In general, you should follow the
[Google Javascript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml). backbone-pageable's
code follows this coding style extremely closely, with 2 exceptions:

- `else` should be on its own line instead of the same line of the close `}` of
  the previous `if` block.
- " is preferred over ' in string literals because the project owner is cursed
   by C.

Testing
=======

backbone-pageable uses [QUnit](http://qunitjs.com/) for testing. To facilitate
console based testing, there's a grunt task. You can use:

```shell
$ grunt qunit
```

Commit Messages
===============

This
[Erlang/OTP commit message guideline](https://github.com/erlang/otp/wiki/Writing-good-commit-messages)
says it all. Take one minute to read it. If you are filing a pull request with
commit messages that don't follow this guideline, don't fret, take another
minute to rewrite them.

```shell
git log # find out how many commits you need to go back
git rebase -i HEAD~<number of changes to go back>
git push origin +<branch>:<branch>
```

Documentation
=============

If you change any Javascript comment documentation, you should rebuild the API
document and submit a separate pull request. There is also a grunt task for this
purpose, but make sure you have installed
[JSDuck](https://github.com/senchalabs/jsduck) first.

```shell
$ grunt jsduck
```

Changes that come with tests are more equal than others.

Pull requests that follow the above guidelines will get merged quicker than
others.

### Note:

Don't forget to keep your tree in sync with upstream and resolve any conflicts
before you submit a pull request. Usage of git-rebase is optional but
encouraged.
