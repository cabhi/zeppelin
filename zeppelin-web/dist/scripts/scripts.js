"use strict";
! function () {
    function a() {
        var a = angular.injector(["ng"]).get("$http"),
            b = angular.injector(["zeppelinWebApp"]).get("baseUrlSrv");
        return a.defaults.withCredentials = !0, a.get(b.getRestApiBase() + "/security/ticket").then(function (a) {
            c.run(["$rootScope", function (b) {
                b.ticket = angular.fromJson(a.data).body
            }])
        }, function (a) { })
    }

    function b() {
        angular.bootstrap(document, ["zeppelinWebApp"])
    }
    var c = angular.module("zeppelinWebApp", ["ngCookies", "ngAnimate", "ngRoute", "ngSanitize", "angular-websocket", "ui.ace", "ui.bootstrap", "as.sortable", "ngTouch", "ngDragDrop", "angular.filter", "monospaced.elastic", "puElasticInput", "xeditable", "ngToast", "focus-if", "ngResource", 'ui.grid',
        'ui.grid.expandable',
        'ui.grid.selection',
        'ui.grid.pinning',
        'ui.grid.infiniteScroll',
        'ui.grid.autoResize',
        'ui.grid.grouping',
        'ui.grid.resizeColumns',
        'ui.grid.exporter',
        'ngJsonExplorer']).filter("breakFilter", function () {
            return function (a) {
                return a ? a.replace(/\n/g, "<br />") : void 0
            }
        }).config(["$httpProvider", "$routeProvider", "ngToastProvider", function (a, b, c) {
            a.defaults.withCredentials = !0, b/*.when("/", {
            templateUrl: "app/home/home.html"
        })*/.when("/notebook/:noteId", {
                    templateUrl: "app/notebook/notebook.html",
                    controller: "NotebookCtrl"
                }).when("/notebook/:noteId/paragraph?=:paragraphId", {
                    templateUrl: "app/notebook/notebook.html",
                    controller: "NotebookCtrl"
                }).when("/notebook/:noteId/paragraph/:paragraphId?", {
                    templateUrl: "app/notebook/notebook.html",
                    controller: "NotebookCtrl"
                }).when("/interpreter", {
                    templateUrl: "app/interpreter/interpreter.html",
                    controller: "InterpreterCtrl"
                }).when("/configuration", {
                    templateUrl: "app/configuration/configuration.html",
                    controller: "ConfigurationCtrl"
                }).when("/search/:searchTerm", {
                    templateUrl: "app/search/result-list.html",
                    controller: "SearchResultCtrl"
                }).otherwise({
                    redirectTo: "/notebook/" + menuData[0].notebooks[0]
                }), c.configure({
                    dismissButton: !0,
                    dismissOnClick: !1,
                    timeout: 6e3
                })
        }]).run(function ($rootScope, $window, $interval, $q, $http) {
            $('#pageLoader').show();
            $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
                $('#pageLoader').show();
                console.log("Started");
            });
            $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
                $('#pageLoader').hide();
            });
            $rootScope.$on('$viewContentLoaded', function () {
                //$('#pageLoader').hide();
                console.log("Ended");
            });
        });
    angular.element(document).ready(function () {
        a().then(b)
    })
} (), angular.module("zeppelinWebApp").controller("MainCtrl", ["$scope", "$rootScope", "$window", function (a, b, c) {
    a.looknfeel = "default";
    var d = function () {
        a.asIframe = c.location.href.indexOf("asIframe") > -1
    };
    d(), b.$on("setIframe", function (b, c) {
        b.defaultPrevented || (a.asIframe = c, b.preventDefault())
    }), b.$on("setLookAndFeel", function (b, c) {
        !b.defaultPrevented && c && "" !== c && c !== a.looknfeel && (a.looknfeel = c, b.preventDefault())
    }), b.$on("$routeChangeStart", function (a, c, d) {
        b.$broadcast("setLookAndFeel", "default")
    }), BootstrapDialog.defaultOptions.onshown = function () {
        angular.element("#" + this.id).find(".btn:last").focus()
    }
}]), angular.module("zeppelinWebApp").controller("HomeCtrl", ["$scope", "notebookListDataFactory", "websocketMsgSrv", "$rootScope", "arrayOrderingSrv", "$http", "baseUrlSrv", function (a, b, c, d, e, f, g) {
    var h = this;
    h.notes = b, h.websocketMsgSrv = c, h.arrayOrderingSrv = e, h.notebookHome = !1, void 0 !== d.ticket ? h.staticHome = !1 : h.staticHome = !0, a.isReloading = !1;
    var i = function () {
        f.get(g.getRestApiBase() + "/version").success(function (b, c, d, e) {
            a.zeppelinVersion = b.body
        }).error(function (a, b, c, d) { })
    },
        j = function () {
            c.getHomeNotebook(), i()
        };
    j(), a.$on("setNoteContent", function (a, b) {
        b ? (h.note = b, d.$broadcast("setLookAndFeel", "home"), h.viewOnly = !0, h.notebookHome = !0, h.staticHome = !1) : (h.staticHome = !0, h.notebookHome = !1)
    }), a.$on("setNoteMenu", function (b, c) {
        a.isReloadingNotes = !1
    }), a.reloadNotebookList = function () {
        c.reloadAllNotesFromRepo(), a.isReloadingNotes = !0
    }
}]), angular.module("zeppelinWebApp").controller("NotebookCtrl", ["$scope", "$route", "$routeParams", "$location", "$rootScope", "$http", "websocketMsgSrv", "baseUrlSrv", "$timeout", "SaveAsService", function (a, b, c, d, e, f, g, h, i, j) {
    a.note = null, a.showEditor = !1, a.editorToggled = !1, a.tableToggled = !1, a.viewOnly = !1, a.showSetting = !1, a.looknfeelOption = ["default", "simple", "report"], a.cronOption = [{
        name: "None",
        value: void 0
    }, {
            name: "1m",
            value: "0 0/1 * * * ?"
        }, {
            name: "5m",
            value: "0 0/5 * * * ?"
        }, {
            name: "1h",
            value: "0 0 0/1 * * ?"
        }, {
            name: "3h",
            value: "0 0 0/3 * * ?"
        }, {
            name: "6h",
            value: "0 0 0/6 * * ?"
        }, {
            name: "12h",
            value: "0 0 0/12 * * ?"
        }, {
            name: "1d",
            value: "0 0 0 * * ?"
        }], a.interpreterSettings = [], a.interpreterBindings = [], a.isNoteDirty = null, a.saveTimer = null;
    var k = !1;
    a.$on("setConnectedStatus", function (a, b) {
        k && b && l(), k = !0
    }), a.getCronOptionNameFromValue = function (b) {
        if (!b) return "";
        for (var c in a.cronOption)
            if (a.cronOption[c].value === b) return a.cronOption[c].name;
        return b
    };
    var l = function () {
        g.getNotebook(c.noteId);
        var a = b.current;
        a && setTimeout(function () {
            var b = a.params,
                c = $("#" + b.paragraph + "_container");
            if (c.length > 0) {
                var d = c.offset().top - 103;
                $("html, body").scrollTo({
                    top: d,
                    left: 0
                })
            }
        }, 1e3)
    };
    l(), a.focusParagraphOnClick = function (b) {
        if (a.note)
            for (var c = 0; c < a.note.paragraphs.length; c++) {
                var d = a.note.paragraphs[c].id;
                if (jQuery.contains(angular.element("#" + d + "_container")[0], b.target)) {
                    a.$broadcast("focusParagraph", d, 0, !0);
                    break
                }
            }
    }, document.addEventListener("click", a.focusParagraphOnClick), a.keyboardShortcut = function (b) {
        a.viewOnly || a.$broadcast("keyEvent", b)
    }, document.addEventListener("keydown", a.keyboardShortcut), a.removeNote = function (a) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this notebook?",
            callback: function (b) {
                b && (g.deleteNotebook(a), d.path("/#"))
            }
        })
    }, a.exportNotebook = function () {
        var b = JSON.stringify(a.note);
        j.SaveAs(b, a.note.name, "json")
    }, a.cloneNote = function (a) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to clone this notebook?",
            callback: function (b) {
                b && (g.cloneNotebook(a), d.path("/#"))
            }
        })
    }, a.checkpointNotebook = function (a) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Commit notebook to current repository?",
            callback: function (b) {
                b && g.checkpointNotebook(c.noteId, a)
            }
        }), document.getElementById("note.checkpoint.message").value = ""
    }, a.runNote = function () {
        // BootstrapDialog.confirm({
        //     closable: !0,
        //     title: "",
        //     message: "Run all paragraphs?",
        //     callback: function (b) {
                /*b &&*/ _.forEach(a.note.paragraphs, function (a, b) {
            angular.element("#" + a.id + "_paragraphColumn_main").scope().runParagraph(a.text)
        })
        //     }
        // })
    }, a.autoRunNote = function () {
        // BootstrapDialog.confirm({
        //     closable: !0,
        //     title: "",
        //     message: "Auto refresh all paragraphs?",
        //     callback: function(b) {
        a.isOnAutoRun = true;
        /*b &&*/ _.forEach(a.note.paragraphs, function (a, b) {
            angular.element("#" + a.id + "_paragraphColumn_main").scope().autoRefresh();
        })
        //     }
        // })
    }, a.clearAutoRunNote = function () {
        // BootstrapDialog.confirm({
        //     closable: !0,
        //     title: "",
        //     message: "Stop auto refresh for all paragraphs?",
        //     callback: function (b) {
        a.isOnAutoRun = false;
                /*b &&*/ _.forEach(a.note.paragraphs, function (a, b) {
            angular.element("#" + a.id + "_paragraphColumn_main").scope().clearAutoRefresh();
        })
        //     }
        // })
    }, a.saveNote = function () {
        a.note && a.note.paragraphs && (_.forEach(a.note.paragraphs, function (a, b) {
            angular.element("#" + a.id + "_paragraphColumn_main").scope().saveParagraph()
        }), a.isNoteDirty = null)
    }, a.clearAllParagraphOutput = function () {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to clear all output?",
            callback: function (b) {
                b && _.forEach(a.note.paragraphs, function (a, b) {
                    angular.element("#" + a.id + "_paragraphColumn_main").scope().clearParagraphOutput()
                })
            }
        })
    }, a.toggleAllEditor = function () {
        a.editorToggled ? a.$broadcast("openEditor") : a.$broadcast("closeEditor"), a.editorToggled = !a.editorToggled
    }, a.showAllEditor = function () {
        a.$broadcast("openEditor")
    }, a.hideAllEditor = function () {
        a.$broadcast("closeEditor")
    }, a.toggleAllTable = function () {
        a.tableToggled ? a.$broadcast("openTable") : a.$broadcast("closeTable"), a.tableToggled = !a.tableToggled
    }, a.showAllTable = function () {
        a.$broadcast("openTable")
    }, a.hideAllTable = function () {
        a.$broadcast("closeTable")
    }, a.isNoteRunning = function () {
        var b = !1;
        if (!a.note) return !1;
        for (var c = 0; c < a.note.paragraphs.length; c++)
            if ("PENDING" === a.note.paragraphs[c].status || "RUNNING" === a.note.paragraphs[c].status) {
                b = !0;
                break
            }
        return b
    }, a.killSaveTimer = function () {
        a.saveTimer && (i.cancel(a.saveTimer), a.saveTimer = null)
    }, a.startSaveTimer = function () {
        a.killSaveTimer(), a.isNoteDirty = !0, a.saveTimer = i(function () {
            a.saveNote()
        }, 1e4)
    }, angular.element(window).on("beforeunload", function (b) {
        a.killSaveTimer(), a.saveNote()
    }), a.$on("$destroy", function () {
        angular.element(window).off("beforeunload"), a.killSaveTimer(), a.saveNote(), document.removeEventListener("click", a.focusParagraphOnClick), document.removeEventListener("keydown", a.keyboardShortcut)
    }), a.setLookAndFeel = function (b) {
        a.note.config.looknfeel = b, a.setConfig()
    }, a.setCronScheduler = function (b) {
        a.note.config.cron = b, a.setConfig()
    }, a.setReleaseResource = function (b) {
        a.note.config.releaseresource = b, a.setConfig()
    }, a.setConfig = function (b) {
        b && (a.note.config = b), g.updateNotebook(a.note.id, a.note.name, a.note.config)
    }, a.sendNewName = function () {
        a.note.name && g.updateNotebook(a.note.id, a.note.name, a.note.config)
    }, a.$on("setNoteContent", function (b, d) {
        a.paragraphUrl = c.paragraphId, a.asIframe = c.asIframe, a.paragraphUrl && (d = n(a.paragraphUrl, d), e.$broadcast("setIframe", a.asIframe)), null === a.note ? a.note = d : o(d), m(), p(q)
    });
    var m = function () {
        a.note.config.looknfeel ? a.viewOnly = "report" === a.note.config.looknfeel : a.note.config.looknfeel = "default", e.$broadcast("setLookAndFeel", a.note.config.looknfeel)
    },
        n = function (a, b) {
            var c = {};
            c.id = b.id, c.name = b.name, c.config = b.config, c.info = b.info, c.paragraphs = [];
            for (var d = 0; d < b.paragraphs.length; d++)
                if (b.paragraphs[d].id === a) {
                    c.paragraphs[0] = b.paragraphs[d], c.paragraphs[0].config || (c.paragraphs[0].config = {}), c.paragraphs[0].config.editorHide = !0, c.paragraphs[0].config.tableHide = !1;
                    break
                }
            return c
        };
    a.$on("insertParagraph", function (b, c, d) {
        for (var e = -1, f = 0; f < a.note.paragraphs.length; f++)
            if (a.note.paragraphs[f].id === c) {
                e = "above" === d ? f : f + 1;
                break
            }
        0 > e || e > a.note.paragraphs.length || g.insertParagraph(e)
    }), a.$on("moveParagraphUp", function (b, c) {
        for (var d = -1, e = 0; e < a.note.paragraphs.length; e++)
            if (a.note.paragraphs[e].id === c) {
                d = e - 1;
                break
            }
        if (!(0 > d || d >= a.note.paragraphs.length)) {
            var f = a.note.paragraphs[d].id;
            angular.element("#" + c + "_paragraphColumn_main").scope().saveParagraph(), angular.element("#" + f + "_paragraphColumn_main").scope().saveParagraph(), g.moveParagraph(c, d)
        }
    }), a.$on("moveParagraphDown", function (b, c) {
        for (var d = -1, e = 0; e < a.note.paragraphs.length; e++)
            if (a.note.paragraphs[e].id === c) {
                d = e + 1;
                break
            }
        if (!(0 > d || d >= a.note.paragraphs.length)) {
            var f = a.note.paragraphs[d].id;
            angular.element("#" + c + "_paragraphColumn_main").scope().saveParagraph(), angular.element("#" + f + "_paragraphColumn_main").scope().saveParagraph(), g.moveParagraph(c, d)
        }
    }), a.$on("moveFocusToPreviousParagraph", function (b, c) {
        for (var d = !1, e = a.note.paragraphs.length - 1; e >= 0; e--) {
            if (d !== !1) {
                a.$broadcast("focusParagraph", a.note.paragraphs[e].id, -1);
                break
            }
            a.note.paragraphs[e].id !== c || (d = !0)
        }
    }), a.$on("moveFocusToNextParagraph", function (b, c) {
        for (var d = !1, e = 0; e < a.note.paragraphs.length; e++) {
            if (d !== !1) {
                a.$broadcast("focusParagraph", a.note.paragraphs[e].id, 0);
                break
            }
            a.note.paragraphs[e].id !== c || (d = !0)
        }
    });
    var o = function (b) {
        b.name !== a.note.name && (a.note.name = b.name), a.note.config = b.config, a.note.info = b.info;
        for (var c, d, e = b.paragraphs.map(function (a) {
            return a.id
        }), f = a.note.paragraphs.map(function (a) {
            return a.id
        }), g = e.length, h = f.length, i = 0; i < a.note.paragraphs.length; i++) {
            var j = a.note.paragraphs[i].id;
            if (angular.element("#" + j + "_paragraphColumn_main").scope().paragraphFocused) {
                d = j;
                break
            }
        }
        if (g > h)
            for (var k in e) {
                if (f[k] !== e[k]) {
                    a.note.paragraphs.splice(k, 0, b.paragraphs[k]), c = b.paragraphs[k].id;
                    break
                }
                a.$broadcast("updateParagraph", {
                    note: a.note,
                    paragraph: b.paragraphs[k]
                })
            }
        if (g === h)
            for (var l in e) {
                var m = b.paragraphs[l];
                if (f[l] === e[l]) a.$broadcast("updateParagraph", {
                    note: a.note,
                    paragraph: m
                });
                else {
                    var n = f.indexOf(e[l]);
                    a.note.paragraphs.splice(n, 1), a.note.paragraphs.splice(l, 0, m), f = a.note.paragraphs.map(function (a) {
                        return a.id
                    })
                }
                d === e[l] && (c = d)
            }
        if (h > g)
            for (var o in f)
                if (f[o] !== e[o]) {
                    a.note.paragraphs.splice(o, 1);
                    break
                }
        for (var p = 0; p < a.note.paragraphs.length; p++) c === a.note.paragraphs[p].id && (a.note.paragraphs[p].focus = !0)
    },
        p = function (b) {
            f.get(h.getRestApiBase() + "/notebook/interpreter/bind/" + a.note.id).success(function (c, d, e, f) {
                a.interpreterBindings = c.body, a.interpreterBindingsOrig = angular.copy(a.interpreterBindings), b && b()
                $('#pageLoader').hide();
            }).error(function (a, b, c, d) { })
        },
        q = function () {
            var b, c, d = !1;
            for (b in a.interpreterBindings)
                if (c = a.interpreterBindings[b], c.selected) {
                    d = !0;
                    break
                }
            if (!d) {
                var e = {};
                for (b in a.interpreterBindings) c = a.interpreterBindings[b], e[c.group] || (c.selected = !0, e[c.group] = !0);
                a.showSetting = !0
            }
        };
    a.interpreterSelectionListeners = {
        accept: function (a, b) {
            return !0
        },
        itemMoved: function (a) { },
        orderChanged: function (a) { }
    }, a.openSetting = function () {
        a.showSetting = !0, p()
    }, a.closeSetting = function () {
        s() ? BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Changes will be discarded.",
            callback: function (b) {
                b && a.$apply(function () {
                    a.showSetting = !1
                })
            }
        }) : a.showSetting = !1
    }, a.saveSetting = function () {
        var b = [];
        for (var c in a.interpreterBindings) {
            var d = a.interpreterBindings[c];
            d.selected && b.push(d.id)
        }
        f.put(h.getRestApiBase() + "/notebook/interpreter/bind/" + a.note.id, b).success(function (b, c, d, e) {
            a.showSetting = !1
        }).error(function (a, b, c, d) { })
    }, a.toggleSetting = function () {
        a.showSetting ? a.closeSetting() : a.openSetting()
    };
    var r = function (b) {
        f.get(h.getRestApiBase() + "/notebook/" + a.note.id + "/permissions").success(function (c, d, e, f) {
            a.permissions = c.body, a.permissionsOrig = angular.copy(a.permissions), b && b()
        }).error(function (a, b, c, d) { })
    };
    a.openPermissions = function () {
        a.showPermissions = !0, r()
    }, a.closePermissions = function () {
        t() ? BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Changes will be discarded.",
            callback: function (b) {
                b && a.$apply(function () {
                    a.showPermissions = !1
                })
            }
        }) : a.showPermissions = !1
    }, a.savePermissions = function () {
        f.put(h.getRestApiBase() + "/notebook/" + a.note.id + "/permissions", a.permissions, {
            withCredentials: !0
        }).success(function (b, c, d, e) {
            a.showPermissions = !1
        }).error(function (a, b, c, d) {
            BootstrapDialog.alert({
                closable: !0,
                title: "Insufficient privileges",
                message: a.message
            })
        })
    }, a.togglePermissions = function () {
        a.showPermissions ? a.closePermissions() : a.openPermissions()
    };
    var s = function () {
        return !angular.equals(a.interpreterBindings, a.interpreterBindingsOrig)
    },
        t = function () {
            return !angular.equals(a.permissions, a.permissionsOrig)
        }
}]), angular.module("zeppelinWebApp").controller("InterpreterCtrl", ["$scope", "$route", "$routeParams", "$location", "$rootScope", "$http", "baseUrlSrv", "ngToast", function (a, b, c, d, e, f, g, h) {
    var i = [];
    a.interpreterSettings = [], a.availableInterpreters = {}, a.showAddNewSetting = !1, a.showRepositoryInfo = !1, a._ = _;
    var j = function () {
        f.get(g.getRestApiBase() + "/interpreter/setting").success(function (b, c, d, e) {
            a.interpreterSettings = b.body
        }).error(function (a, b, c, d) { })
    },
        k = function () {
            f.get(g.getRestApiBase() + "/interpreter").success(function (b, c, d, e) {
                a.availableInterpreters = b.body
            }).error(function (a, b, c, d) { })
        },
        l = function (a) {
            angular.extend(a, {
                propertyValue: "",
                propertyKey: ""
            })
        },
        m = function (a) {
            angular.extend(a, {
                depArtifact: "",
                depExclude: ""
            })
        },
        n = function (a) {
            i.splice(a, 1)
        };
    a.copyOriginInterpreterSettingProperties = function (b) {
        var c = _.findIndex(a.interpreterSettings, {
            id: b
        });
        i[c] = angular.copy(a.interpreterSettings[c])
    }, a.updateInterpreterSetting = function (b, c) {
        var d = confirm("Do you want to update this interpreter and restart with new settings?");
        if (d) {
            var e = _.findIndex(a.interpreterSettings, {
                id: c
            }),
                i = a.interpreterSettings[e];
            ("" !== i.propertyKey || i.propertyKey) && a.addNewInterpreterProperty(c), ("" !== i.depArtifact || i.depArtifact) && a.addNewInterpreterDependency(c), i.option || (i.option = {}), void 0 === i.option.remote && (i.option.remote = !0);
            var j = {
                option: angular.copy(i.option),
                properties: angular.copy(i.properties),
                dependencies: angular.copy(i.dependencies)
            };
            f.put(g.getRestApiBase() + "/interpreter/setting/" + c, j).success(function (b, c, d, f) {
                a.interpreterSettings[e] = b.body, n(e)
            }).error(function (a, c, d, e) {
                h.danger({
                    content: a.message,
                    verticalPosition: "bottom"
                }), b.$show()
            })
        }
    }, a.resetInterpreterSetting = function (b) {
        var c = _.findIndex(a.interpreterSettings, {
            id: b
        });
        a.interpreterSettings[c] = angular.copy(i[c]), n(c)
    }, a.removeInterpreterSetting = function (b) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this interpreter setting?",
            callback: function (c) {
                c && f.delete(g.getRestApiBase() + "/interpreter/setting/" + b).success(function (c, d, e, f) {
                    var g = _.findIndex(a.interpreterSettings, {
                        id: b
                    });
                    a.interpreterSettings.splice(g, 1)
                }).error(function (a, b, c, d) { })
            }
        })
    }, a.newInterpreterGroupChange = function () {
        for (var b = _.pluck(_.filter(a.availableInterpreters, {
            group: a.newInterpreterSetting.group
        }), "properties"), c = {}, d = 0; d < b.length; d++) {
            var e = b[d];
            for (var f in e) c[f] = {
                value: e[f].defaultValue,
                description: e[f].description
            }
        }
        a.newInterpreterSetting.properties = c
    }, a.restartInterpreterSetting = function (b) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to restart this interpreter?",
            callback: function (c) {
                c && f.put(g.getRestApiBase() + "/interpreter/setting/restart/" + b).success(function (c, d, e, f) {
                    var g = _.findIndex(a.interpreterSettings, {
                        id: b
                    });
                    a.interpreterSettings[g] = c.body
                }).error(function (a, b, c, d) { })
            }
        })
    }, a.addNewInterpreterSetting = function () {
        if (!a.newInterpreterSetting.name || !a.newInterpreterSetting.group) return void BootstrapDialog.alert({
            closable: !0,
            title: "Add interpreter",
            message: "Please determine name and interpreter"
        });
        if (_.findIndex(a.interpreterSettings, {
            name: a.newInterpreterSetting.name
        }) >= 0) return void BootstrapDialog.alert({
            closable: !0,
            title: "Add interpreter",
            message: "Name " + a.newInterpreterSetting.name + " already exists"
        });
        var b = a.newInterpreterSetting;
        ("" !== b.propertyKey || b.propertyKey) && a.addNewInterpreterProperty(), ("" !== b.depArtifact || b.depArtifact) && a.addNewInterpreterDependency();
        var c = angular.copy(a.newInterpreterSetting),
            d = {};
        for (var e in b.properties) d[e] = b.properties[e].value;
        c.properties = d, f.post(g.getRestApiBase() + "/interpreter/setting", c).success(function (b, c, d, e) {
            a.resetNewInterpreterSetting(), j(), a.showAddNewSetting = !1
        }).error(function (a, b, c, d) {
            h.danger({
                content: a.message,
                verticalPosition: "bottom"
            })
        })
    }, a.cancelInterpreterSetting = function () {
        a.showAddNewSetting = !1, a.resetNewInterpreterSetting()
    }, a.resetNewInterpreterSetting = function () {
        a.newInterpreterSetting = {
            name: void 0,
            group: void 0,
            properties: {},
            dependencies: [],
            option: {
                remote: !0,
                perNoteSession: !1
            }
        }, l(a.newInterpreterSetting)
    }, a.removeInterpreterProperty = function (b, c) {
        if (void 0 === c) delete a.newInterpreterSetting.properties[b];
        else {
            var d = _.findIndex(a.interpreterSettings, {
                id: c
            });
            delete a.interpreterSettings[d].properties[b]
        }
    }, a.removeInterpreterDependency = function (b, c) {
        if (void 0 === c) a.newInterpreterSetting.dependencies = _.reject(a.newInterpreterSetting.dependencies, function (a) {
            return a.groupArtifactVersion === b
        });
        else {
            var d = _.findIndex(a.interpreterSettings, {
                id: c
            });
            a.interpreterSettings[d].dependencies = _.reject(a.interpreterSettings[d].dependencies, function (a) {
                return a.groupArtifactVersion === b
            })
        }
    }, a.addNewInterpreterProperty = function (b) {
        if (void 0 === b) {
            if (!a.newInterpreterSetting.propertyKey || "" === a.newInterpreterSetting.propertyKey) return;
            a.newInterpreterSetting.properties[a.newInterpreterSetting.propertyKey] = {
                value: a.newInterpreterSetting.propertyValue
            }, l(a.newInterpreterSetting)
        } else {
            var c = _.findIndex(a.interpreterSettings, {
                id: b
            }),
                d = a.interpreterSettings[c];
            if (!d.propertyKey || "" === d.propertyKey) return;
            d.properties[d.propertyKey] = d.propertyValue, l(d)
        }
    }, a.addNewInterpreterDependency = function (b) {
        if (void 0 === b) {
            if (!a.newInterpreterSetting.depArtifact || "" === a.newInterpreterSetting.depArtifact) return;
            var c = a.newInterpreterSetting;
            for (var d in c.dependencies) c.dependencies[d].groupArtifactVersion === c.depArtifact && (c.dependencies[d] = {
                groupArtifactVersion: c.depArtifact,
                exclusions: c.depExclude
            }, c.dependencies.splice(d, 1));
            c.dependencies.push({
                groupArtifactVersion: c.depArtifact,
                exclusions: "" === c.depExclude ? [] : c.depExclude
            }), m(c)
        } else {
            var e = _.findIndex(a.interpreterSettings, {
                id: b
            }),
                f = a.interpreterSettings[e];
            if (!f.depArtifact || "" === f.depArtifact) return;
            for (var g in f.dependencies) f.dependencies[g].groupArtifactVersion === f.depArtifact && (f.dependencies[g] = {
                groupArtifactVersion: f.depArtifact,
                exclusions: f.depExclude
            }, f.dependencies.splice(g, 1));
            f.dependencies.push({
                groupArtifactVersion: f.depArtifact,
                exclusions: "" === f.depExclude ? [] : f.depExclude
            }), m(f)
        }
    }, a.resetNewRepositorySetting = function () {
        a.newRepoSetting = {
            id: void 0,
            url: void 0,
            snapshot: !1,
            username: void 0,
            password: void 0
        }
    };
    var o = function () {
        f.get(g.getRestApiBase() + "/interpreter/repository").success(function (b, c, d, e) {
            a.repositories = b.body
        }).error(function (a, b, c, d) { })
    };
    a.addNewRepository = function () {
        var b = angular.copy(a.newRepoSetting);
        f.post(g.getRestApiBase() + "/interpreter/repository", b).success(function (b, c, d, e) {
            o(), a.resetNewRepositorySetting(), angular.element("#repoModal").modal("hide")
        }).error(function (a, b, c, d) { })
    }, a.removeRepository = function (b) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this repository?",
            callback: function (c) {
                c && f.delete(g.getRestApiBase() + "/interpreter/repository/" + b).success(function (c, d, e, f) {
                    var g = _.findIndex(a.repositories, {
                        id: b
                    });
                    a.repositories.splice(g, 1)
                }).error(function (a, b, c, d) { })
            }
        })
    }, a.isDefaultRepository = function (a) {
        return "central" === a || "local" === a
    };
    var p = function () {
        a.resetNewInterpreterSetting(), a.resetNewRepositorySetting(), j(), k(), o()
    };
    p()
}]), angular.module("zeppelinWebApp").controller("ConfigurationCtrl", ["$scope", "$route", "$routeParams", "$location", "$rootScope", "$http", "baseUrlSrv", function (a, b, c, d, e, f, g) {
    a.configrations = [], a._ = _;
    var h = function () {
        f.get(g.getRestApiBase() + "/configurations/all").success(function (b, c, d, e) {
            a.configurations = b.body
        }).error(function (a, b, c, d) { })
    },
        i = function () {
            h()
        };
    i()
}]), angular.module("zeppelinWebApp").controller("ParagraphCtrl", ["$scope", "$rootScope", "$route", "$window", "$element", "$routeParams", "$location", "$timeout", "$compile", "websocketMsgSrv", "ngToast", "$interval", function (a, b, c, d, e, f, g, h, i, j, k, $interval) {
    var params = f;
    var l = "_Z_ANGULAR_FUNC_";
    a.data = [];
    a.gridOptions = {
        onRegisterApi: onRegisterApi,
        infiniteScrollDown: true,
        data: 'data',
        treeRowHeaderAlwaysVisible: false,
        enableHorizontalScrollbar: 0, // never
        enableGridMenu: false,
        exporterCsvFilename: 'export.csv',
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        useExternalSorting: false,
        expandableRowHeight: 300,
        expandableRowTemplate: 'app/notebook/paragraph/json-viewer.html'
    };
    var colDef = [];
    function onRegisterApi(gridApi) {
        if (gridApi.expandable) {
            gridApi.expandable.on.rowExpandedStateChanged(a, onExpand);
        }
        a.gridApi = gridApi;
    }
    var autoRefresh = function () {
        if ("RUNNING" === a.paragraph.status || "PENDING" === a.paragraph.status) {
            return;
        }
        else {
            a.runParagraph(a.getEditorValue());
            return;
        }
    }
    a.autoRefresh = function () {
        a.stopAutoRef = $interval(autoRefresh, refreshInterval);
    }
    a.clearAutoRefresh = function () {
        if (angular.isDefined(a.stopAutoRef)) {
            $interval.cancel(a.stopAutoRef);
            a.stopAutoRef = undefined;
        }
        a.cancelParagraph();
    }
    function onExpand(row) {
        if (row.isExpanded) {
        }
    }
    a.parentNote = null, a.paragraph = null, a.originalText = "", a.editor = null;
    var m = b.$new(!0, b);
    a.compiledScope = m, m.z = {
        runParagraph: function (b) {
            if (b) {
                var c = a.parentNote.paragraphs.filter(function (a) {
                    return a.id === b
                });
                if (1 === c.length) {
                    var d = c[0];
                    j.runParagraph(d.id, d.title, d.text, d.config, d.settings.params)
                } else k.danger({
                    content: "Cannot find a paragraph with id '" + b + "'",
                    verticalPosition: "top",
                    dismissOnTimeout: !1
                })
            } else k.danger({
                content: "Please provide a 'paragraphId' when calling z.runParagraph(paragraphId)",
                verticalPosition: "top",
                dismissOnTimeout: !1
            })
        },
        angularBind: function (a, b, c) {
            c ? j.clientBindAngularObject(f.noteId, a, b, c) : k.danger({
                content: "Please provide a 'paragraphId' when calling z.angularBind(varName, value, 'PUT_HERE_PARAGRAPH_ID')",
                verticalPosition: "top",
                dismissOnTimeout: !1
            })
        },
        angularUnbind: function (a, b) {
            b ? j.clientUnbindAngularObject(f.noteId, a, b) : k.danger({
                content: "Please provide a 'paragraphId' when calling z.angularUnbind(varName, 'PUT_HERE_PARAGRAPH_ID')",
                verticalPosition: "top",
                dismissOnTimeout: !1
            })
        }
    };
    var n = {},
        o = {
            "ace/mode/python": /^%(\w*\.)?pyspark\s*$/,
            "ace/mode/scala": /^%(\w*\.)?spark\s*$/,
            "ace/mode/sql": /^%(\w*\.)?\wql/,
            "ace/mode/markdown": /^%md/,
            "ace/mode/sh": /^%sh/
        };
    a.init = function (b, c) {
        a.paragraph = b, a.parentNote = c, a.originalText = angular.copy(b.text), a.chart = {}, a.colWidthOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], a.showTitleEditor = !1, a.paragraphFocused = !1, b.focus && (a.paragraphFocused = !0), a.paragraph.config || (a.paragraph.config = {}), p(), "TABLE" === a.getResultType() ? (a.loadTableData(a.paragraph.result), a.setGraphMode(a.getGraphMode(), !1, !1)) : "HTML" === a.getResultType() ? a.renderHtml() : "ANGULAR" === a.getResultType() ? a.renderAngular() : "TEXT" === a.getResultType() && a.renderText()
    }, a.renderHtml = function () {
        var b = function () {
            if (angular.element("#p" + a.paragraph.id + "_html").length) try {
                angular.element("#p" + a.paragraph.id + "_html").html(a.paragraph.result.msg), angular.element("#p" + a.paragraph.id + "_html").find("pre code").each(function (a, b) {
                    hljs.highlightBlock(b)
                })
            } catch (c) { } else h(b, 10)
        };
        h(b)
    }, a.renderAngular = function () {
        var b = function () {
            if (angular.element("#p" + a.paragraph.id + "_angular").length) try {
                angular.element("#p" + a.paragraph.id + "_angular").html(a.paragraph.result.msg), i(angular.element("#p" + a.paragraph.id + "_angular").contents())(m)
            } catch (c) { } else h(b, 10)
        };
        h(b)
    }, a.renderText = function () {
        var b = function () {
            a.oneAtATime = true;

            a.groups = [
                {
                    title: 'Dynamic Group Header - 1',
                    content: 'Dynamic Group Body - 1'
                },
                {
                    title: 'Dynamic Group Header - 2',
                    content: 'Dynamic Group Body - 2'
                }
            ];

            a.items = ['Item 1', 'Item 2', 'Item 3'];

            a.addItem = function () {
                var newItemNo = a.items.length + 1;
                a.items.push('Item ' + newItemNo);
            };

            a.status = {
                isFirstOpen: true,
                isFirstDisabled: false
            };
            //var c = angular.element("#p" + a.paragraph.id + "_text");
            try {
                var data = JSON.parse(a.paragraph.result.msg);
            }
            catch (err) {
            }
            if (data && data.rows && data.rows.length > 0) {
                a.data = data.rows;
            }
            // c.length ? (a.clearTextOutput(), a.paragraph.result && a.paragraph.result.msg && a.appendTextOutput(a.paragraph.result.msg), angular.element("#p" + a.paragraph.id + "_text").bind("mousewheel", function(b) {
            //     a.keepScrollDown = !1
            // }), a.flushStreamingOutput = !0) : h(b, 10)
        };
        h(b)
    }, a.clearTextOutput = function () {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        b.length && b.children().remove()
    }, a.appendTextOutput = function (b) {
        var c = angular.element("#p" + a.paragraph.id + "_text");
        if (c.length)
            for (var d = b.split("\n"), e = 0; e < d.length; e++) c.append(angular.element("<div></div>").text(d[e]));
        if (a.keepScrollDown) {
            var f = angular.element("#p" + a.paragraph.id + "_text");
            f[0].scrollTop = f[0].scrollHeight
        }
    }, a.$on("angularObjectUpdate", function (b, d) {
        var e = c.current.pathParams.noteId;
        if (!d.noteId || d.noteId === e && (!d.paragraphId || d.paragraphId === a.paragraph.id)) {
            var f = m,
                g = d.angularObject.name;
            if (angular.equals(d.angularObject.object, f[g])) return;
            if (n[g] ? (n[g].noteId = n[g].noteId || d.noteId, n[g].paragraphId = n[g].paragraphId || d.paragraphId) : n[g] = {
                interpreterGroupId: d.interpreterGroupId,
                noteId: d.noteId,
                paragraphId: d.paragraphId
            }, n[g].skipEmit = !0, n[g].clearWatcher || (n[g].clearWatcher = f.$watch(g, function (a, b) {
                return n[g].skipEmit ? void (n[g].skipEmit = !1) : void j.updateAngularObject(n[g].noteId, n[g].paragraphId, g, a, n[g].interpreterGroupId)
            })), f[g] = d.angularObject.object, g.startsWith(l)) {
                var h = g.substring(l.length);
                f[h] = function () {
                    f[g] = arguments
                }
            }
        }
    }), a.$on("angularObjectRemove", function (b, d) {
        var e = c.current.pathParams.noteId;
        if (!d.noteId || d.noteId === e && (!d.paragraphId || d.paragraphId === a.paragraph.id)) {
            var f = m,
                g = d.name;
            if (n[g] && (n[g].clearWatcher(), n[g] = void 0), f[g] = void 0, g.startsWith(l)) {
                var h = g.substring(l.length);
                f[h] = void 0
            }
        }
    });
    var p = function () {
        var b = a.paragraph.config;
        b.colWidth || (b.colWidth = 12), b.graph || (b.graph = {}), b.graph.mode || (b.graph.mode = "table"), b.graph.height || (b.graph.height = 300), b.graph.optionOpen || (b.graph.optionOpen = !1), b.graph.keys || (b.graph.keys = []), b.graph.values || (b.graph.values = []), b.graph.groups || (b.graph.groups = []), b.graph.scatter || (b.graph.scatter = {}), void 0 === b.enabled && (b.enabled = !0)
    };
    a.getIframeDimensions = function () {
        if (a.asIframe) {
            var b = "#" + f.paragraphId + "_container",
                c = angular.element(b).height();
            return c
        }
        return 0
    }, a.$watch(a.getIframeDimensions, function (b, c) {
        if (a.asIframe && b) {
            var e = {};
            e.height = b, e.url = g.$$absUrl, d.parent.postMessage(angular.toJson(e), "*")
        }
    });
    var q = function (a) {
        return !a
    };
    a.$on("updateParagraph", function (c, d) {
        if (!(d.paragraph.id !== a.paragraph.id || d.paragraph.dateCreated === a.paragraph.dateCreated && d.paragraph.dateFinished === a.paragraph.dateFinished && d.paragraph.dateStarted === a.paragraph.dateStarted && d.paragraph.dateUpdated === a.paragraph.dateUpdated && d.paragraph.status === a.paragraph.status && d.paragraph.jobName === a.paragraph.jobName && d.paragraph.title === a.paragraph.title && q(d.paragraph.result) === q(a.paragraph.result) && d.paragraph.errorMessage === a.paragraph.errorMessage && angular.equals(d.paragraph.settings, a.paragraph.settings) && angular.equals(d.paragraph.config, a.paragraph.config))) {
            var e = a.getResultType(),
                f = a.getResultType(d.paragraph),
                g = a.getGraphMode(),
                h = a.getGraphMode(d.paragraph),
                i = d.paragraph.dateFinished !== a.paragraph.dateFinished || q(d.paragraph.result) !== q(a.paragraph.result),
                j = d.paragraph.status !== a.paragraph.status;
            if (a.paragraph.text !== d.paragraph.text && (a.dirtyText ? a.dirtyText === d.paragraph.text ? (a.paragraph.text = d.paragraph.text, a.dirtyText = void 0, a.originalText = angular.copy(d.paragraph.text)) : a.paragraph.text = a.dirtyText : (a.paragraph.text = d.paragraph.text, a.originalText = angular.copy(d.paragraph.text))), a.paragraph.aborted = d.paragraph.aborted, a.paragraph.dateUpdated = d.paragraph.dateUpdated, a.paragraph.dateCreated = d.paragraph.dateCreated, a.paragraph.dateFinished = d.paragraph.dateFinished, a.paragraph.dateStarted = d.paragraph.dateStarted, a.paragraph.errorMessage = d.paragraph.errorMessage, a.paragraph.jobName = d.paragraph.jobName, a.paragraph.title = d.paragraph.title, a.paragraph.lineNumbers = d.paragraph.lineNumbers, a.paragraph.status = d.paragraph.status, a.paragraph.result = d.paragraph.result, a.paragraph.settings = d.paragraph.settings, a.asIframe ? (d.paragraph.config.editorHide = !0, d.paragraph.config.tableHide = !1, a.paragraph.config = d.paragraph.config) : (a.paragraph.config = d.paragraph.config, p()), "TABLE" === f ? (a.loadTableData(a.paragraph.result), ("TABLE" !== e || i) && (A(), B()), g !== h ? a.setGraphMode(h, !1, !1) : a.setGraphMode(h, !1, !0)) : "HTML" === f && i ? a.renderHtml() : "ANGULAR" === f && i ? a.renderAngular() : "TEXT" === f && i && a.renderText(), j || i) {
                var k = angular.element('div[id$="_paragraphColumn_main"');
                k.length >= 2 && k[k.length - 2].id.startsWith(a.paragraph.id) && setTimeout(function () {
                    b.$broadcast("scrollToCursor")
                }, 500)
            }
        }
    }), a.$on("appendParagraphOutput", function (b, c) {
        a.paragraph.id === c.paragraphId && (a.flushStreamingOutput && (a.clearTextOutput(), a.flushStreamingOutput = !1), a.appendTextOutput(c.data))
    }), a.$on("updateParagraphOutput", function (b, c) {
        a.paragraph.id === c.paragraphId && (a.clearTextOutput(), a.appendTextOutput(c.data))
    }), a.isRunning = function () {
        return "RUNNING" === a.paragraph.status || "PENDING" === a.paragraph.status
    }, a.cancelParagraph = function () {
        j.cancelParagraphRun(a.paragraph.id)
    }, a.runParagraph = function (b) {
        j.runParagraph(a.paragraph.id, a.paragraph.title, b, a.paragraph.config, a.paragraph.settings.params), a.originalText = angular.copy(b), a.dirtyText = void 0
    }, a.saveParagraph = function () {
        void 0 !== a.dirtyText && a.dirtyText !== a.originalText && (t(a.paragraph.title, a.dirtyText, a.paragraph.config, a.paragraph.settings.params), a.originalText = angular.copy(a.dirtyText), a.dirtyText = void 0)
    }, a.toggleEnableDisable = function () {
        a.paragraph.config.enabled = !a.paragraph.config.enabled;
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.run = function () {
        var b = a.editor.getValue();
        b && "RUNNING" !== a.paragraph.status && "PENDING" !== a.paragraph.status && a.runParagraph(b)
    }, a.moveUp = function () {
        a.$emit("moveParagraphUp", a.paragraph.id)
    }, a.moveDown = function () {
        a.$emit("moveParagraphDown", a.paragraph.id)
    }, a.insertNew = function (b) {
        a.$emit("insertParagraph", a.paragraph.id, b || "below")
    }, a.removeParagraph = function () {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this paragraph?",
            callback: function (b) {
                b && j.removeParagraph(a.paragraph.id)
            }
        })
    }, a.clearParagraphOutput = function () {
        j.clearParagraphOutput(a.paragraph.id)
    }, a.toggleEditor = function () {
        a.paragraph.config.editorHide ? a.openEditor() : a.closeEditor()
    }, a.closeEditor = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.editorHide = !0, t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.openEditor = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.editorHide = !1, t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.closeTable = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.tableHide = !0, t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.openTable = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.tableHide = !1, t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.showTitle = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.title = !0, t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.hideTitle = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.title = !1, t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.setTitle = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.showLineNumbers = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.lineNumbers = !0, a.editor.renderer.setShowGutter(!0), t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.hideLineNumbers = function () {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.lineNumbers = !1, a.editor.renderer.setShowGutter(!1), t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.columnWidthClass = function (b) {
        return a.asIframe ? "col-md-12" : "col-md-" + b
    }, a.changeColWidth = function () {
        angular.element(".navbar-right.open").removeClass("open");
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        t(a.paragraph.title, a.paragraph.text, c, b)
    }, a.toggleGraphOption = function () {
        var b = angular.copy(a.paragraph.config);
        b.graph.optionOpen ? b.graph.optionOpen = !1 : b.graph.optionOpen = !0;
        var c = angular.copy(a.paragraph.settings.params);
        t(a.paragraph.title, a.paragraph.text, b, c)
    }, a.toggleOutput = function () {
        var b = angular.copy(a.paragraph.config);
        b.tableHide = !b.tableHide;
        var c = angular.copy(a.paragraph.settings.params);
        t(a.paragraph.title, a.paragraph.text, b, c)
    }, a.toggleLineWithFocus = function () {
        var b = a.getGraphMode();
        return "lineWithFocusChart" === b ? (a.setGraphMode("lineChart", !0), !0) : "lineChart" === b ? (a.setGraphMode("lineWithFocusChart", !0), !0) : !1
    }, a.loadForm = function (b, c) {
        var d = b.defaultValue;
        c[b.name] && (d = c[b.name]), a.paragraph.settings.params[b.name] = d
    }, a.toggleCheckbox = function (b, c) {
        var d = a.paragraph.settings.params[b.name].indexOf(c.value);
        d > -1 ? a.paragraph.settings.params[b.name].splice(d, 1) : a.paragraph.settings.params[b.name].push(c.value)
    }, a.aceChanged = function () {
        a.dirtyText = a.editor.getSession().getValue(), a.startSaveTimer(), h(function () {
            a.setParagraphMode(a.editor.getSession(), a.dirtyText, a.editor.getCursorPosition())
        })
    }, a.aceLoaded = function (c) {
        var d = ace.require("ace/ext/language_tools"),
            e = ace.require("ace/range").Range;
        if (c.$blockScrolling = 1 / 0, a.editor = c, "{{paragraph.id}}_editor" !== c.container.id) {
            a.editor.renderer.setShowGutter(a.paragraph.config.lineNumbers), a.editor.setShowFoldWidgets(!1), a.editor.setHighlightActiveLine(!1), a.editor.setHighlightGutterLine(!1), a.editor.getSession().setUseWrapMode(!0), a.editor.setTheme("ace/theme/chrome"), a.paragraphFocused && a.editor.focus(), r(c.container.id), angular.element(window).resize(function () {
                r(c.container.id)
            }), -1 !== navigator.appVersion.indexOf("Mac") ? (a.editor.setKeyboardHandler("ace/keyboard/emacs"), b.isMac = !0) : -1 === navigator.appVersion.indexOf("Win") && -1 === navigator.appVersion.indexOf("X11") && -1 === navigator.appVersion.indexOf("Linux") || (b.isMac = !1), a.setParagraphMode = function (b, c, d) {
                if ("undefined" == typeof d || 0 === d.row && d.column < 30)
                    if ("undefined" == typeof d && a.paragraph.config.editorMode) b.setMode(a.paragraph.config.editorMode);
                    else {
                        var e = "ace/mode/scala",
                            f = b.getMode().$id;
                        if (!o[f] || !o[f].test(c)) {
                            for (var g in o)
                                if (g !== f && o[g].test(c)) return a.paragraph.config.editorMode = g, b.setMode(g), !0;
                            a.paragraph.config.editorMode = e, b.setMode(e)
                        }
                    }
            };
            var f = {
                getCompletions: function (b, c, d, f, g) {
                    if (a.editor.isFocused()) {
                        d = c.getTextRange(new e(0, 0, d.row, d.column)).length;
                        var h = c.getValue();
                        j.completion(a.paragraph.id, h, d), a.$on("completionList", function (a, b) {
                            if (b.completions) {
                                var c = [];
                                for (var d in b.completions) {
                                    var e = b.completions[d];
                                    c.push({
                                        name: e,
                                        value: e,
                                        score: 300
                                    })
                                }
                                g(null, c)
                            }
                        })
                    }
                }
            };
            d.setCompleters([f, d.keyWordCompleter, d.snippetCompleter, d.textCompleter]), a.editor.setOptions({
                enableBasicAutocompletion: !0,
                enableSnippets: !1,
                enableLiveAutocompletion: !1
            }), a.handleFocus = function (b) {
                a.paragraphFocused = b, h(function () {
                    a.$digest()
                })
            }, a.editor.on("focus", function () {
                a.handleFocus(!0)
            }), a.editor.on("blur", function () {
                a.handleFocus(!1)
            }), a.editor.getSession().on("change", function (a, b) {
                r(c.container.id)
            }), a.setParagraphMode(a.editor.getSession(), a.editor.getSession().getValue()), a.editor.commands.bindKey("ctrl-alt-n.", null), a.editor.commands.bindKey("ctrl-.", "startAutocomplete"), a.editor.commands.bindKey("ctrl-space", null), a.editor.keyBinding.origOnCommandKey = a.editor.keyBinding.onCommandKey, a.editor.keyBinding.onCommandKey = function (b, c, d) {
                if (a.editor.completer && a.editor.completer.activated);
                else {
                    if (parseInt(angular.element("#" + a.paragraph.id + "_editor > textarea").css("top").replace("px", "")) < 0) {
                        var e = a.editor.getCursorPosition(),
                            f = a.editor.renderer.$cursorLayer.getPixelPosition(e, !0);
                        angular.element("#" + a.paragraph.id + "_editor > textarea").css("top", f.top)
                    }
                    var g, h;
                    38 === d || 80 === d && b.ctrlKey && !b.altKey ? (g = a.editor.getSession().getLength(), h = a.editor.getCursorPosition().row, 0 === h ? a.$emit("moveFocusToPreviousParagraph", a.paragraph.id) : a.scrollToCursor(a.paragraph.id, -1)) : (40 === d || 78 === d && b.ctrlKey && !b.altKey) && (g = a.editor.getSession().getLength(), h = a.editor.getCursorPosition().row, h === g - 1 ? a.$emit("moveFocusToNextParagraph", a.paragraph.id) : a.scrollToCursor(a.paragraph.id, 1))
                }
                this.origOnCommandKey(b, c, d)
            }
        }
    };
    var r = function (b) {
        var c = a.editor,
            d = c.getSession().getScreenLength() * c.renderer.lineHeight + c.renderer.scrollBar.getWidth();
        angular.element("#" + b).height(d.toString() + "px"), c.resize()
    };
    b.$on("scrollToCursor", function (b) {
        var c = angular.element('div[id$="_paragraphColumn_main"');
        c[c.length - 1].id.startsWith(a.paragraph.id) && a.scrollToCursor(a.paragraph.id, 0)
    }), a.scrollToCursor = function (b, c) {
        if (a.editor.isFocused()) {
            var d, e = a.editor.renderer.lineHeight,
                f = 103,
                g = 50,
                h = angular.element(document).height(),
                i = angular.element(window).height(),
                j = angular.element(document).scrollTop(),
                k = angular.element("#" + b + "_editor").offset(),
                l = a.editor.getCursorPosition(),
                m = a.editor.renderer.$cursorLayer.getPixelPosition(l, !0),
                n = k.top + m.top + e * c;
            j + f + g > n ? (d = n - f - (i - f) / 3, 0 > d && (d = 0)) : n > j + g + i - f && (d = n - f - 2 * (i - f) / 3, d > h && (d = h));
            var o = angular.element("body");
            o.stop(), o.finish(), o.scrollTo(d, {
                axis: "y",
                interrupt: !0,
                duration: 100
            })
        }
    };
    a.getEditorValue = function () {
        return a.editor.getValue()
    }, a.getProgress = function () {
        return a.currentProgress ? a.currentProgress : 0
    }, a.getExecutionTime = function () {
        var b = a.paragraph,
            c = Date.parse(b.dateFinished) - Date.parse(b.dateStarted);
        if (isNaN(c) || 0 > c) return a.isResultOutdated() ? "outdated" : "";
        var d = "Took " + c / 1e3 + " seconds";
        return a.isResultOutdated() && (d += " (outdated)"), d
    }, a.isResultOutdated = function () {
        var b = a.paragraph;
        return void 0 !== b.dateUpdated && Date.parse(b.dateUpdated) > Date.parse(b.dateStarted)
    }, a.$on("updateProgress", function (b, c) {
        c.id === a.paragraph.id && (a.currentProgress = c.progress)
    }), a.$on("keyEvent", function (b, c) {
        if (a.paragraphFocused) {
            var d = a.paragraph.id,
                e = c.keyCode,
                f = !1,
                g = a.paragraph.config.editorHide;
            if (g && (38 === e || 80 === e && c.ctrlKey && !c.altKey)) a.$emit("moveFocusToPreviousParagraph", d);
            else if (g && (40 === e || 78 === e && c.ctrlKey && !c.altKey)) a.$emit("moveFocusToNextParagraph", d);
            else if (c.shiftKey && 13 === e) a.run();
            else if (c.ctrlKey && c.altKey && 67 === e) a.cancelParagraph();
            else if (c.ctrlKey && c.altKey && 68 === e) a.removeParagraph();
            else if (c.ctrlKey && c.altKey && 75 === e) a.moveUp();
            else if (c.ctrlKey && c.altKey && 74 === e) a.moveDown();
            else if (c.ctrlKey && c.altKey && 65 === e) a.insertNew("above");
            else if (c.ctrlKey && c.altKey && 66 === e) a.insertNew("below");
            else if (c.ctrlKey && c.altKey && 79 === e) a.toggleOutput();
            else if (c.ctrlKey && c.altKey && 82 === e) a.toggleEnableDisable();
            else if (c.ctrlKey && c.altKey && 69 === e) a.toggleEditor();
            else if (c.ctrlKey && c.altKey && 77 === e) a.paragraph.config.lineNumbers ? a.hideLineNumbers() : a.showLineNumbers();
            else if (c.ctrlKey && c.shiftKey && 189 === e) a.paragraph.config.colWidth = Math.max(1, a.paragraph.config.colWidth - 1), a.changeColWidth();
            else if (c.ctrlKey && c.shiftKey && 187 === e) a.paragraph.config.colWidth = Math.min(12, a.paragraph.config.colWidth + 1), a.changeColWidth();
            else if (c.ctrlKey && c.altKey && (e >= 48 && 57 >= e || 189 === e || 187 === e)) {
                var h = 12;
                h = 48 === e ? 10 : 189 === e ? 11 : 187 === e ? 12 : e - 48, a.paragraph.config.colWidth = h, a.changeColWidth()
            } else c.ctrlKey && c.altKey && 84 === e ? a.paragraph.config.title ? a.hideTitle() : a.showTitle() : f = !0;
            f || c.preventDefault()
        }
    }), a.$on("focusParagraph", function (b, c, d, e) {
        if (a.paragraph.id === c) {
            if (!a.paragraph.config.editorHide && !e) {
                a.editor.focus();
                var f;
                d >= 0 ? (f = d, a.editor.gotoLine(f, 0)) : (f = a.editor.session.getLength(), a.editor.gotoLine(f, 0)), a.scrollToCursor(a.paragraph.id, 0)
            }
            a.handleFocus(!0)
        } else a.editor.blur(), a.handleFocus(!1)
    }), a.$on("runParagraph", function (b) {
        a.runParagraph(a.editor.getValue())
    }), a.$on("openEditor", function (b) {
        a.openEditor()
    }), a.$on("closeEditor", function (b) {
        a.closeEditor()
    }), a.$on("openTable", function (b) {
        a.openTable()
    }), a.$on("closeTable", function (b) {
        a.closeTable()
    }), a.getResultType = function (b) {
        var c = b ? b : a.paragraph;
        return c.result && c.result.type ? c.result.type : "TEXT"
    }, a.getBase64ImageSrc = function (a) {
        return "data:image/png;base64," + a
    }, a.getGraphMode = function (b) {
        var c = b ? b : a.paragraph;
        return c.config.graph && c.config.graph.mode ? c.config.graph.mode : "table"
    }, a.loadTableData = function (a) {
        if (a && "TABLE" === a.type) {
            var b = [],
                c = [],
                d = [],
                e = a.msg.split("\n");
            a.comment = "";
            for (var f = !1, g = 0; g < e.length; g++) {
                var h = e[g];
                if (f) a.comment += h;
                else if ("" !== h) {
                    for (var i = h.split("	"), j = [], k = [], l = 0; l < i.length; l++) {
                        var m = i[l];
                        0 === g ? b.push({
                            name: m,
                            index: l,
                            aggr: "sum"
                        }) : (j.push(m), k.push({
                            key: b[g] ? b[g].name : void 0,
                            value: m
                        }))
                    }
                    0 !== g && (c.push(j), d.push(k))
                } else c.length > 0 && (f = !0)
            }
            a.msgTable = d, a.columnNames = b, a.rows = c
        }
    }, a.setGraphMode = function (b, c, d) {
        if (c) s(b);
        else {
            A();
            var e = a.paragraph.config.graph.height;
            angular.element("#p" + a.paragraph.id + "_graph").height("auto"), b && "table" !== b ? z(b, a.paragraph.result, d) : u(a.paragraph.result, d)
        }
    };
    var s = function (b) {
        var c = angular.copy(a.paragraph.config),
            d = angular.copy(a.paragraph.settings.params);
        c.graph.mode = b, t(a.paragraph.title, a.paragraph.text, c, d)
    },
        t = function (b, c, d, e) {
            j.commitParagraph(a.paragraph.id, b, c, d, e)
        },
        u = function (b, c, d) {
            var e = function (a) {
                return isNaN(a) && a.length > "%html".length && "%html " === a.substring(0, "%html ".length) ? "html" : ""
            },
                f = function (a) {
                    if (isNaN(a)) {
                        var b = e(a);
                        return "" !== b ? a.substring(b.length + 2) : a
                    }
                    var c = a.toString(),
                        d = c.split("."),
                        f = d[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    return d.length > 1 && (f += "." + d[1]), f
                },
                g = function () {
                    var b = "";
                    a.data = [];
                    colDef = [];
                    for (var idx = 0; idx < a.paragraph.result.rows.length; idx++) {
                        var dRow = a.paragraph.result.rows[idx];
                        var row = {};
                        for (var i = 0; i < a.paragraph.result.columnNames.length; i++) {
                            var col = a.paragraph.result.columnNames[i].name;
                            col = col.replace("[0]", "");
                            row[col] = dRow[i];
                            if (idx == 0) {
                                colDef.push({ name: col, field: col, width: '*', wordWrap: true, cellTooltip: true, enableHiding: false })
                                //if (i == a.paragraph.result.columnNames.length - 1) {
                                a.defined = true;
                                //}
                            }
                        }
                        a.data.push(row);
                    }
                    //if (!a.colSet) {
                    a.gridOptions.columnDefs = colSettings && colSettings[params.noteId] ? colSettings[params.noteId] : colDef;
                    //a.colSet = true;
                    //}
                    /*b += '<table class="table table-hover table-condensed">', b += "  <thead>", b += '    <tr style="background-color: #F6F6F6; font-weight: bold;">';
                    for (var c in a.paragraph.result.columnNames) b += "<th>" + a.paragraph.result.columnNames[c].name + "</th>";
                    b += "    </tr>", b += "  </thead>", b += "  <tbody>";
                    for (var d in a.paragraph.result.msgTable) {
                        var g = a.paragraph.result.msgTable[d];
                        b += "    <tr>";
                        for (var h in g) {
                            var i = g[h].value;
                            "html" !== e(i) && (i = i.replace(/[\u00A0-\u9999<>\&]/gim, function(a) {
                                return "&#" + a.charCodeAt(0) + ";"
                            })), b += "      <td>" + f(i) + "</td>"
                        }
                        b += "    </tr>"
                    }
                    if (b += "  </tbody>", b += "</table>", angular.element("#p" + a.paragraph.id + "_table").html(b), a.paragraph.result.msgTable.length > 1e4) {
                        angular.element("#p" + a.paragraph.id + "_table").css("overflow", "scroll");
                        var j = a.paragraph.config.graph.height;
                        angular.element("#p" + a.paragraph.id + "_table").css("height", j)
                    } else {
                        var k = angular.element("#p" + a.paragraph.id + "_table .table");
                        k.floatThead({
                            scrollContainer: function(b) {
                                return angular.element("#p" + a.paragraph.id + "_table")
                            }
                        }), angular.element("#p" + a.paragraph.id + "_table .table").on("remove", function() {
                            angular.element("#p" + a.paragraph.id + "_table .table").floatThead("destroy")
                        }), angular.element("#p" + a.paragraph.id + "_table").css("position", "relative"), angular.element("#p" + a.paragraph.id + "_table").css("height", "100%"), angular.element("#p" + a.paragraph.id + "_table").perfectScrollbar("destroy"), angular.element("#p" + a.paragraph.id + "_table").perfectScrollbar(), angular.element(".ps-scrollbar-y-rail").css("z-index", "1002");
                        var l = a.paragraph.config.graph.height;
                        angular.element("#p" + a.paragraph.id + "_table").css("height", l), angular.element("#p" + a.paragraph.id + "_table").perfectScrollbar("update")
                    }*/
                },
                i = function () {
                    if (angular.element("#p" + a.paragraph.id + "_table").length) try {
                        g()
                    } catch (b) { } else h(i, 10)
                };
            h(i)
        },
        v = function (a) {
            return d3.format(",")(d3.round(a, 3))
        },
        w = function (a) {
            var b = d3.format(".3s")(a);
            switch (b[b.length - 1]) {
                case "G":
                    return b.slice(0, -1) + "B"
            }
            return b
        },
        x = function (a, b) {
            return !b[a] || !isNaN(parseFloat(b[a])) && isFinite(b[a]) ? a : b[a]
        },
        y = function (a) {
            return a >= Math.pow(10, 6) ? w(a) : v(a)
        },
        z = function (b, c, d) {
            if (!a.chart[b]) {
                var e = nv.models[b]();
                a.chart[b] = e
            }
            var f, g, i = [];
            if ("scatterChart" === b) {
                var j = F(c, d);
                f = j.xLabels, g = j.yLabels, i = j.d3g, a.chart[b].xAxis.tickFormat(function (a) {
                    return x(a, f)
                }), a.chart[b].yAxis.tickFormat(function (a) {
                    return x(a, g)
                }), a.chart[b].tooltipContent(function (b, c, d, e, f) {
                    var g = "<h3>" + b + "</h3>";
                    return a.paragraph.config.graph.scatter.size && a.isValidSizeOption(a.paragraph.config.graph.scatter, a.paragraph.result.rows) && (g += "<p>" + f.point.size + "</p>"), g
                }), a.chart[b].showDistX(!0).showDistY(!0)
            } else {
                var k = C(c);
                if ("pieChart" === b) {
                    var l = D(k, !0).d3g;
                    if (a.chart[b].x(function (a) {
                        return a.label
                    }).y(function (a) {
                        return a.value
                    }), l.length > 0)
                        for (var m = 0; m < l[0].values.length; m++) {
                            var n = l[0].values[m];
                            i.push({
                                label: n.x,
                                value: n.y
                            })
                        }
                } else if ("multiBarChart" === b) i = D(k, !0, !1, b).d3g, a.chart[b].yAxis.axisLabelDistance(50), a.chart[b].yAxis.tickFormat(function (a) {
                    return y(a)
                });
                else if ("lineChart" === b || "stackedAreaChart" === b || "lineWithFocusChart" === b) {
                    var o = D(k, !1, !0);
                    f = o.xLabels, i = o.d3g, a.chart[b].xAxis.tickFormat(function (a) {
                        return x(a, f)
                    }), a.chart[b].yAxis.tickFormat(function (a) {
                        return y(a)
                    }), a.chart[b].yAxis.axisLabelDistance(50), a.chart[b].useInteractiveGuideline && a.chart[b].useInteractiveGuideline(!0), a.paragraph.config.graph.forceY ? a.chart[b].forceY([0]) : a.chart[b].forceY([])
                }
            }
            var p = function () {
                var c = a.paragraph.config.graph.height,
                    d = 300,
                    e = 150;
                try {
                    i[0].values.length > e && (d = 0)
                } catch (f) { }
                d3.select("#p" + a.paragraph.id + "_" + b + " svg").attr("height", a.paragraph.config.graph.height).datum(i).transition().duration(d).call(a.chart[b]);
                d3.select("#p" + a.paragraph.id + "_" + b + " svg").style.height = c + "px", nv.utils.windowResize(a.chart[b].update)
            },
                q = function () {
                    if (0 !== angular.element("#p" + a.paragraph.id + "_" + b + " svg").length) try {
                        p()
                    } catch (c) { } else h(q, 10)
                };
            h(q)
        };
    a.isGraphMode = function (b) {
        return "TABLE" === a.getResultType() && a.getGraphMode() === b
    }, a.onGraphOptionChange = function () {
        A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeGraphOptionKeys = function (b) {
        a.paragraph.config.graph.keys.splice(b, 1), A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeGraphOptionValues = function (b) {
        a.paragraph.config.graph.values.splice(b, 1), A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeGraphOptionGroups = function (b) {
        a.paragraph.config.graph.groups.splice(b, 1), A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.setGraphOptionValueAggr = function (b, c) {
        a.paragraph.config.graph.values[b].aggr = c, A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionXaxis = function (b) {
        a.paragraph.config.graph.scatter.xAxis = null, A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionYaxis = function (b) {
        a.paragraph.config.graph.scatter.yAxis = null, A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionGroup = function (b) {
        a.paragraph.config.graph.scatter.group = null, A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionSize = function (b) {
        a.paragraph.config.graph.scatter.size = null, A(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    };
    var A = function () {
        var b = function (a) {
            for (var b = 0; b < a.length; b++)
                for (var c = b + 1; c < a.length; c++) angular.equals(a[b], a[c]) && a.splice(c, 1)
        },
            c = function (b) {
                for (var c = 0; c < b.length; c++) {
                    for (var d = !1, e = 0; e < a.paragraph.result.columnNames.length; e++) {
                        var f = b[c],
                            g = a.paragraph.result.columnNames[e];
                        if (f.index === g.index && f.name === g.name) {
                            d = !0;
                            break
                        }
                    }
                    d || b.splice(c, 1)
                }
            },
            d = function (b) {
                for (var c in b)
                    if (b[c]) {
                        for (var d = !1, e = 0; e < a.paragraph.result.columnNames.length; e++) {
                            var f = b[c],
                                g = a.paragraph.result.columnNames[e];
                            if (f.index === g.index && f.name === g.name) {
                                d = !0;
                                break
                            }
                        }
                        d || (b[c] = null)
                    }
            };
        b(a.paragraph.config.graph.keys), c(a.paragraph.config.graph.keys), c(a.paragraph.config.graph.values), b(a.paragraph.config.graph.groups), c(a.paragraph.config.graph.groups), d(a.paragraph.config.graph.scatter)
    },
        B = function () {
            0 === a.paragraph.config.graph.keys.length && a.paragraph.result.columnNames.length > 0 && a.paragraph.config.graph.keys.push(a.paragraph.result.columnNames[0]), 0 === a.paragraph.config.graph.values.length && a.paragraph.result.columnNames.length > 1 && a.paragraph.config.graph.values.push(a.paragraph.result.columnNames[1]), a.paragraph.config.graph.scatter.xAxis || a.paragraph.config.graph.scatter.yAxis || (a.paragraph.result.columnNames.length > 1 ? (a.paragraph.config.graph.scatter.xAxis = a.paragraph.result.columnNames[0], a.paragraph.config.graph.scatter.yAxis = a.paragraph.result.columnNames[1]) : 1 === a.paragraph.result.columnNames.length && (a.paragraph.config.graph.scatter.xAxis = a.paragraph.result.columnNames[0]))
        },
        C = function (b) {
            for (var c = a.paragraph.config.graph.keys, d = a.paragraph.config.graph.groups, e = a.paragraph.config.graph.values, f = {
                sum: function (a, b) {
                    var c = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                        d = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                    return c + d
                },
                count: function (a, b) {
                    var c = void 0 !== a ? parseInt(a) : 0,
                        d = void 0 !== b ? 1 : 0;
                    return c + d
                },
                min: function (a, b) {
                    var c = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                        d = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                    return Math.min(c, d)
                },
                max: function (a, b) {
                    var c = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                        d = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                    return Math.max(c, d)
                },
                avg: function (a, b, c) {
                    var d = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                        e = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                    return d + e
                }
            }, g = {
                sum: !1,
                count: !1,
                min: !1,
                max: !1,
                avg: !0
            }, h = {}, i = {}, j = 0; j < b.rows.length; j++) {
                for (var k = b.rows[j], l = h, m = i, n = 0; n < c.length; n++) {
                    var o = c[n];
                    l[o.name] || (l[o.name] = {
                        order: n,
                        index: o.index,
                        type: "key",
                        children: {}
                    }), l = l[o.name].children;
                    var p = k[o.index];
                    m[p] || (m[p] = {}), m = m[p]
                }
                for (var q = 0; q < d.length; q++) {
                    var r = d[q],
                        s = k[r.index];
                    l[s] || (l[s] = {
                        order: q,
                        index: r.index,
                        type: "group",
                        children: {}
                    }), l = l[s].children, m[s] || (m[s] = {}), m = m[s]
                }
                for (var t = 0; t < e.length; t++) {
                    var u = e[t],
                        v = u.name + "(" + u.aggr + ")";
                    l[v] || (l[v] = {
                        type: "value",
                        order: t,
                        index: u.index
                    }), m[v] ? m[v] = {
                        value: f[u.aggr](m[v].value, k[u.index], m[v].count + 1),
                        count: g[u.aggr] ? m[v].count + 1 : m[v].count
                    } : m[v] = {
                        value: "count" !== u.aggr ? k[u.index] : 1,
                        count: 1
                    }
                }
            }
            return {
                schema: h,
                rows: i
            }
        },
        D = function (b, c, d, e) {
            var f = [],
                g = b.schema,
                h = b.rows,
                i = a.paragraph.config.graph.values,
                j = function (a, b) {
                    return a ? a + "." + b : b
                },
                k = function (a, b) {
                    for (var c in a.children) b[c] = {}, k(a.children[c], b[c])
                },
                l = function (a, b, c, e, f, g, h, i) {
                    "key" === b.type ? (g = j(g, a), h = j(h, c)) : "group" === b.type ? i = j(i, c) : ("value" === b.type && a === c || o) && (i = j(i, c), f(g, h, i, e));
                    for (var m in b.children)
                        if (d && "group" === b.children[m].type && void 0 === e[m]) {
                            var n = {};
                            k(b.children[m], n), l(m, b.children[m], m, n, f, g, h, i)
                        } else
                            for (var p in e) "key" !== b.children[m].type && m !== p || l(m, b.children[m], p, e[p], f, g, h, i)
                },
                m = a.paragraph.config.graph.keys,
                n = a.paragraph.config.graph.groups;
            i = a.paragraph.config.graph.values;
            var o = 0 === m.length && 0 === n.length && i.length > 0,
                p = 0 === m.length,
                q = "multiBarChart" === e,
                r = Object.keys(g)[0],
                s = {},
                t = 0,
                u = {},
                v = 0,
                w = {};
            for (var x in h) l(r, g[r], x, h[x], function (a, b, d, e) {
                void 0 === s[b] && (w[t] = b, s[b] = t++), void 0 === u[d] && (u[d] = v++);
                var g = u[d];
                p && q && (g = 0), f[g] || (f[g] = {
                    values: [],
                    key: p && q ? "values" : d
                });
                var h = isNaN(b) ? c ? b : s[b] : parseFloat(b),
                    i = 0;
                void 0 === h && (h = d), void 0 !== e && (i = isNaN(e.value) ? 0 : parseFloat(e.value) / parseFloat(e.count)), f[g].values.push({
                    x: h,
                    y: i
                })
            });
            var y, z, A = {};
            for (y in u) z = y.substring(0, y.lastIndexOf("(")), A[z] ? A[z]++ : A[z] = 1;
            if (o)
                for (var B = 0; B < f[0].values.length; B++) y = f[0].values[B].x, y && (z = y.substring(0, y.lastIndexOf("(")), A[z] <= 1 && (f[0].values[B].x = z));
            else {
                for (var C = 0; C < f.length; C++) y = f[C].key, z = y.substring(0, y.lastIndexOf("(")), A[z] <= 1 && (f[C].key = z);
                if (1 === n.length && 1 === i.length)
                    for (C = 0; C < f.length; C++) y = f[C].key, y = y.split(".")[0], f[C].key = y
            }
            return {
                xLabels: w,
                d3g: f
            }
        },
        E = function (b) {
            for (var c, d, e, f = a.paragraph.config.graph.scatter.xAxis, g = a.paragraph.config.graph.scatter.yAxis, h = a.paragraph.config.graph.scatter.group, i = {}, j = 0; j < b.rows.length; j++) {
                var k = b.rows[j];
                f && (c = k[f.index]), g && (d = k[g.index]), h && (e = k[h.index]);
                var l = c + "," + d + "," + e;
                i[l] ? i[l].size++ : i[l] = {
                    x: c,
                    y: d,
                    group: e,
                    size: 1
                }
            }
            var m = [];
            for (var n in i) {
                var o = [];
                f && (o[f.index] = i[n].x), g && (o[g.index] = i[n].y), h && (o[h.index] = i[n].group), o[b.rows[0].length] = i[n].size, m.push(o)
            }
            return m
        },
        F = function (b, c) {
            var d, e, f, g = a.paragraph.config.graph.scatter.xAxis,
                h = a.paragraph.config.graph.scatter.yAxis,
                i = a.paragraph.config.graph.scatter.group,
                j = a.paragraph.config.graph.scatter.size,
                k = [],
                l = [],
                m = {},
                n = [],
                o = {},
                p = {},
                q = {},
                r = {},
                s = {},
                t = {},
                u = 0,
                v = 0,
                w = 0,
                x = "";
            if (!g && !h) return {
                d3g: []
            };
            for (var y = 0; y < b.rows.length; y++) f = b.rows[y], g && (d = f[g.index], k[y] = d), h && (e = f[h.index], l[y] = e);
            var z = g && h && G(k) && G(l) || !g && G(l) || !h && G(k);
            for (m = z ? E(b) : b.rows, !i && z ? x = "count" : i || j ? !i && j && (x = j.name) : g && h ? x = "(" + g.name + ", " + h.name + ")" : g && !h ? x = g.name : !g && h && (x = h.name), y = 0; y < m.length; y++) {
                f = m[y], g && (d = f[g.index]), h && (e = f[h.index]), i && (x = f[i.index]);
                var A = z ? f[f.length - 1] : j ? f[j.index] : 1;
                void 0 === q[x] && (t[w] = x, q[x] = w++), g && void 0 === o[d] && (r[u] = d, o[d] = u++), h && void 0 === p[e] && (s[v] = e, p[e] = v++), n[q[x]] || (n[q[x]] = {
                    key: x,
                    values: []
                }), n[q[x]].values.push({
                    x: g ? isNaN(d) ? o[d] : parseFloat(d) : 0,
                    y: h ? isNaN(e) ? p[e] : parseFloat(e) : 0,
                    size: isNaN(parseFloat(A)) ? 1 : parseFloat(A)
                })
            }
            return {
                xLabels: r,
                yLabels: s,
                d3g: n
            }
        },
        G = function (a) {
            for (var b = function (a) {
                for (var b = {}, c = [], d = 0, e = 0; e < a.length; e++) {
                    var f = a[e];
                    1 !== b[f] && (b[f] = 1, c[d++] = f)
                }
                return c
            }, c = 0; c < a.length; c++)
                if (isNaN(parseFloat(a[c])) && ("string" == typeof a[c] || a[c] instanceof String)) return !0;
            var d = .05,
                e = b(a);
            return e.length / a.length < d
        };
    a.isValidSizeOption = function (a, b) {
        for (var c = [], d = [], e = 0; e < b.length; e++) {
            var f = b[e],
                g = f[a.size.index];
            if (isNaN(parseFloat(g)) || !isFinite(g)) return !1;
            if (a.xAxis) {
                var h = f[a.xAxis.index];
                c[e] = h
            }
            if (a.yAxis) {
                var i = f[a.yAxis.index];
                d[e] = i
            }
        }
        var j = a.xAxis && a.yAxis && G(c) && G(d) || !a.xAxis && G(d) || !a.yAxis && G(c);
        return !j
    }, a.resizeParagraph = function (b, c) {
        a.paragraph.config.colWidth !== b ? (a.paragraph.config.colWidth = b, a.changeColWidth(), h(function () {
            r(a.paragraph.id + "_editor"), a.changeHeight(c)
        }, 200)) : a.changeHeight(c)
    }, a.changeHeight = function (b) {
        var c = angular.copy(a.paragraph.settings.params),
            d = angular.copy(a.paragraph.config);
        d.graph.height = b, t(a.paragraph.title, a.paragraph.text, d, c)
    }, "function" != typeof String.prototype.startsWith && (String.prototype.startsWith = function (a) {
        return this.slice(0, a.length) === a
    }), a.goToSingleParagraph = function () {
        var b = c.current.pathParams.noteId,
            e = location.protocol + "//" + location.host + location.pathname + "#/notebook/" + b + "/paragraph/" + a.paragraph.id + "?asIframe";
        d.open(e)
    }, a.showScrollDownIcon = function () {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        return b[0] ? b[0].scrollHeight > b.innerHeight() : !1
    }, a.scrollParagraphDown = function () {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        b.animate({
            scrollTop: b[0].scrollHeight
        }, 500), a.keepScrollDown = !0
    }, a.showScrollUpIcon = function () {
        return angular.element("#p" + a.paragraph.id + "_text")[0] ? 0 !== angular.element("#p" + a.paragraph.id + "_text")[0].scrollTop : !1
    }, a.scrollParagraphUp = function () {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        b.animate({
            scrollTop: 0
        }, 500), a.keepScrollDown = !1
    }
}]), angular.module("zeppelinWebApp").controller("SearchResultCtrl", ["$scope", "$routeParams", "searchService", function (a, b, c) {
    var d = c.search({
        q: b.searchTerm
    }).query();
    d.$promise.then(function (c) {
        a.notes = c.body.map(function (a) {
            return /\/paragraph\//.test(a.id) ? (a.id = a.id.replace("paragraph/", "?paragraph=") + "&term=" + b.searchTerm, a) : a
        })
    }), a.page = 0, a.allResults = !1, a.highlightSearchResults = function (a) {
        return function (b) {
            function c(a) {
                var b = {
                    "ace/mode/scala": /^%spark/,
                    "ace/mode/sql": /^%(\w*\.)?\wql/,
                    "ace/mode/markdown": /^%md/,
                    "ace/mode/sh": /^%sh/
                };
                return Object.keys(b).reduce(function (c, d) {
                    return b[d].test(a) ? d : c
                }, "ace/mode/scala")
            }

            function d(a) {
                return function (b) {
                    for (var c = [], d = -1;
                        (d = b.indexOf(a, d + 1)) >= 0;) c.push(d);
                    return c
                }
            }
            var e = ace.require("ace/range").Range;
            b.setOption("highlightActiveLine", !1), b.$blockScrolling = 1 / 0, b.setReadOnly(!0), b.renderer.setShowGutter(!1), b.setTheme("ace/theme/chrome"), b.getSession().setMode(c(a.text));
            var f = a.snippet.split("\n").map(function (a, c) {
                var f = a.match(/<B>(.+?)<\/B>/);
                if (!f) return a;
                var g = f[1],
                    h = a.replace(/<B>/g, "").replace(/<\/B>/g, ""),
                    i = d(g)(h);
                return i.forEach(function (a) {
                    var d = a + g.length;
                    b.getSession().addMarker(new e(c, a, c, d), "search-results-highlight", "line")
                }), h
            });
            b.setOption("maxLines", f.reduce(function (a, b) {
                return a + b.length
            }, 0)), b.getSession().setValue(f.join("\n"))
        }
    }
}]), angular.module("zeppelinWebApp").service("arrayOrderingSrv", function () {
    this.notebookListOrdering = function (a) {
        return a.name ? a.name : "Note " + a.id
    }
}), angular.module("zeppelinWebApp").controller("NavCtrl", ["$scope", "$rootScope", "$routeParams", "$location", "notebookListDataFactory", "websocketMsgSrv", "arrayOrderingSrv", function (a, b, c, d, e, f, g) {
    function h() {
        f.getNotebookList()
    }

    function i(a) {
        return c.noteId === a
    }
    a.showLoginWindow = function () {
        setTimeout(function () {
            angular.element("#userName").focus()
        }, 500)
    };
    var j = this;
    j.menuType = b.menuType ? b.menuType : getMenuType(c.noteId);
    b.menuType = j.menuType;
    j.notes = e, j.connected = f.isConnected(), j.websocketMsgSrv = f, j.arrayOrderingSrv = g, b.ticket && (b.fullUsername = b.ticket.principal, b.truncatedUsername = b.ticket.principal);
    var k = 16;
    angular.element("#notebook-list").perfectScrollbar({
        suppressScrollX: !0
    }), a.$on("setNoteMenu", function (a, b) {
        e.setNotes(b)
        j.notes.list = menuData;
        j.menuType = b.menuType ? b.menuType : getMenuType(c.noteId);
    }), a.$on("setConnectedStatus", function (a, b) {
        j.connected = b
    }), b.$on("$locationChangeSuccess", function () {
        var b = d.path();
        "/" === b && (a.searchTerm = "")
    }), a.checkUsername = function () {
        b.ticket && (b.ticket.principal.length <= k ? b.truncatedUsername = b.ticket.principal : b.truncatedUsername = b.ticket.principal.substr(0, k) + "..")
    }, a.$on("loginSuccess", function (b, c) {
        a.checkUsername(), h()
    }), a.search = function () {
        d.url(/search/ + a.searchTerm)
    }, j.loadNotes = h, j.isActive = i, j.loadNotes(), a.checkUsername(),
        a.$on("menuChanged", function (e, menuType) {
            j.menuType = menuType;
            b.menuType = menuType;
            d.url('/notebook/' + newNoteId(menuType, c.noteId));
        });
    function newNoteId(menuType, current) {
        for (var i = 0; i < menuData.length; i++) {
            for (var j = 0; j < menuData[i].notebooks.length; j++) {
                if (menuData[i].notebooks[j] == current) {
                    return menuData[i].notebooks[menuType];
                }
            }
        }
    }
    function getMenuType(current) {
        console.log(current);
        for (var i = 0; i < menuData.length; i++) {
            for (var j = 0; j < menuData[i].notebooks.length; j++) {
                if (menuData[i].notebooks[j] == current) {
                    return j;
                }
            }
        }
        return 0;
    }
}]), angular.module("zeppelinWebApp").controller("sidebarCtrl", ["$scope", "$rootScope", "$routeParams", "$location", "notebookListDataFactory", "websocketMsgSrv", "arrayOrderingSrv", function (a, b, c, d, e, f, g) {
    var j = this;
    j.switchMenuType = fn;
    function fn(menuType) {
        b.$broadcast("menuChanged", menuType);
    }
}]), angular.module("zeppelinWebApp").directive("ngEscape", function () {
    return function (a, b, c) {
        b.bind("keydown keyup", function (b) {
            27 === b.which && (a.$apply(function () {
                a.$eval(c.ngEscape)
            }), b.preventDefault())
        })
    }
}), angular.module("zeppelinWebApp").controller("NotenameCtrl", ["$scope", "notebookListDataFactory", "$rootScope", "$routeParams", "websocketMsgSrv", function (a, b, c, d, e) {
    var f = this;
    f.clone = !1, f.notes = b, f.websocketMsgSrv = e, a.note = {}, f.createNote = function () {
        if (f.clone) {
            var b = d.noteId;
            f.websocketMsgSrv.cloneNotebook(b, a.note.notename)
        } else f.websocketMsgSrv.createNotebook(a.note.notename)
    }, f.handleNameEnter = function () {
        angular.element("#noteNameModal").modal("toggle"), f.createNote()
    }, f.preVisible = function (b) {
        a.note.notename = f.newNoteName(), f.clone = b, a.$apply()
    }, f.newNoteName = function () {
        var a = 1;
        return angular.forEach(f.notes.list, function (b) {
            if (b = b.name, b.match(/^Untitled Note [0-9]*$/)) {
                var c = 1 * b.substr(14);
                c >= a && (a = c + 1)
            }
        }), "Untitled Note " + a
    }
}]), angular.module("zeppelinWebApp").controller("NoteImportCtrl", ["$scope", "$timeout", "websocketMsgSrv", function (a, b, c) {
    var d = this;
    a.note = {}, a.note.step1 = !0, a.note.step2 = !1, d.resetFlags = function () {
        a.note = {}, a.note.step1 = !0, a.note.step2 = !1, angular.element("#noteImportFile").val("")
    }, a.uploadFile = function () {
        angular.element("#noteImportFile").click()
    }, a.importFile = function (b) {
        a.note.errorText = "", a.note.importFile = b.files[0];
        var c = a.note.importFile,
            e = new FileReader;
        e.onloadend = function () {
            d.processImportJson(e.result)
        }, c && e.readAsText(c)
    }, a.uploadURL = function () {
        a.note.errorText = "", a.note.step1 = !1, b(function () {
            a.note.step2 = !0
        }, 400)
    }, d.importBack = function () {
        a.note.errorText = "", b(function () {
            a.note.step1 = !0
        }, 400), a.note.step2 = !1
    }, d.importNote = function () {
        a.note.errorText = "", a.note.importUrl ? jQuery.getJSON(a.note.importUrl, function (a) {
            d.processImportJson(a)
        }).fail(function () {
            a.note.errorText = "Unable to Fetch URL", a.$apply()
        }) : (a.note.errorText = "Enter URL", a.$apply())
    }, d.processImportJson = function (b) {
        if ("object" != typeof b) try {
            b = JSON.parse(b)
        } catch (d) {
            return a.note.errorText = "JSON parse exception", void a.$apply()
        }
        b.paragraphs && b.paragraphs.length > 0 ? (a.note.noteImportName ? b.name = a.note.noteImportName : a.note.noteImportName = b.name, c.importNotebook(b)) : a.note.errorText = "Invalid JSON", a.$apply()
    }, a.$on("setNoteMenu", function (a, b) {
        d.resetFlags(), angular.element("#noteImportModal").modal("hide")
    })
}]), angular.module("zeppelinWebApp").directive("popoverHtmlUnsafePopup", function () {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            title: "@",
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "components/popover-html-unsafe/popover-html-unsafe-popup.html"
    }
}).directive("popoverHtmlUnsafe", ["$tooltip", function (a) {
    return a("popoverHtmlUnsafe", "popover", "click")
}]), angular.module("zeppelinWebApp").directive("ngEnter", function () {
    return function (a, b, c) {
        b.bind("keydown keypress", function (b) {
            13 === b.which && (a.$apply(function () {
                a.$eval(c.ngEnter)
            }), b.preventDefault())
        })
    }
}), angular.module("zeppelinWebApp").directive("dropdownInput", function () {
    return {
        restrict: "A",
        link: function (a, b) {
            b.bind("click", function (a) {
                a.stopPropagation()
            })
        }
    }
}), angular.module("zeppelinWebApp").directive("resizable", function () {
    var a = {
        autoHide: !0,
        handles: "se",
        helper: "resizable-helper",
        stop: function () {
            angular.element(this).css({
                width: "100%",
                height: "100%"
            })
        }
    };
    return {
        restrict: "A",
        scope: {
            callback: "&onResize"
        },
        link: function (b, c, d) {
            d.$observe("resize", function (d) {
                var e = function (c, d) {
                    var e = window.innerWidth / 12;
                    c.off("resizestop");
                    var f = angular.copy(a);
                    "TABLE" === d.graphType || "TEXT" === d.graphType ? (f.grid = [e, 10], f.minHeight = 100) : (f.grid = [e, 1e4], f.minHeight = 0), f.maxWidth = window.innerWidth, c.resizable(f), c.on("resizestop", function () {
                        if (b.callback) {
                            var a = c.height();
                            50 > a && (a = 300), b.callback({
                                width: Math.ceil(c.width() / e),
                                height: a
                            })
                        }
                    })
                };
                d = JSON.parse(d), "true" === d.allowresize && (e(c, d), angular.element(window).resize(function () {
                    e(c, d)
                }))
            })
        }
    }
}), angular.module("zeppelinWebApp").directive("modalvisible", function () {
    return {
        restrict: "A",
        scope: {
            preVisibleCallback: "&previsiblecallback",
            postVisibleCallback: "&postvisiblecallback",
            targetinput: "@targetinput"
        },
        link: function (a, b, c) {
            var d = a.preVisibleCallback,
                e = a.postVisibleCallback;
            b.on("show.bs.modal", function (a) {
                var b = angular.element(a.relatedTarget),
                    c = b.data("clone"),
                    e = !!c;
                d()(e)
            }), b.on("shown.bs.modal", function (b) {
                a.targetinput && angular.element(b.target).find("input#" + a.targetinput).select(), e()
            })
        }
    }
}), angular.module("zeppelinWebApp").service("websocketMsgSrv", ["$rootScope", "websocketEvents", function (a, b) {
    return {
        getHomeNotebook: function () {
            b.sendNewEvent({
                op: "GET_HOME_NOTE"
            })
        },
        createNotebook: function (a) {
            b.sendNewEvent({
                op: "NEW_NOTE",
                data: {
                    name: a
                }
            })
        },
        deleteNotebook: function (a) {
            b.sendNewEvent({
                op: "DEL_NOTE",
                data: {
                    id: a
                }
            })
        },
        cloneNotebook: function (a, c) {
            b.sendNewEvent({
                op: "CLONE_NOTE",
                data: {
                    id: a,
                    name: c
                }
            })
        },
        getNotebookList: function () {
            b.sendNewEvent({
                op: "LIST_NOTES"
            })
        },
        reloadAllNotesFromRepo: function () {
            b.sendNewEvent({
                op: "RELOAD_NOTES_FROM_REPO"
            })
        },
        getNotebook: function (a) {
            b.sendNewEvent({
                op: "GET_NOTE",
                data: {
                    id: a
                }
            })
        },
        updateNotebook: function (a, c, d) {
            b.sendNewEvent({
                op: "NOTE_UPDATE",
                data: {
                    id: a,
                    name: c,
                    config: d
                }
            })
        },
        moveParagraph: function (a, c) {
            b.sendNewEvent({
                op: "MOVE_PARAGRAPH",
                data: {
                    id: a,
                    index: c
                }
            })
        },
        insertParagraph: function (a) {
            b.sendNewEvent({
                op: "INSERT_PARAGRAPH",
                data: {
                    index: a
                }
            })
        },
        updateAngularObject: function (a, c, d, e, f) {
            b.sendNewEvent({
                op: "ANGULAR_OBJECT_UPDATED",
                data: {
                    noteId: a,
                    paragraphId: c,
                    name: d,
                    value: e,
                    interpreterGroupId: f
                }
            })
        },
        clientBindAngularObject: function (a, c, d, e) {
            b.sendNewEvent({
                op: "ANGULAR_OBJECT_CLIENT_BIND",
                data: {
                    noteId: a,
                    name: c,
                    value: d,
                    paragraphId: e
                }
            })
        },
        clientUnbindAngularObject: function (a, c, d) {
            b.sendNewEvent({
                op: "ANGULAR_OBJECT_CLIENT_UNBIND",
                data: {
                    noteId: a,
                    name: c,
                    paragraphId: d
                }
            })
        },
        cancelParagraphRun: function (a) {
            b.sendNewEvent({
                op: "CANCEL_PARAGRAPH",
                data: {
                    id: a
                }
            })
        },
        runParagraph: function (a, c, d, e, f) {
            b.sendNewEvent({
                op: "RUN_PARAGRAPH",
                data: {
                    id: a,
                    title: c,
                    paragraph: d,
                    config: e,
                    params: f
                }
            })
        },
        removeParagraph: function (a) {
            b.sendNewEvent({
                op: "PARAGRAPH_REMOVE",
                data: {
                    id: a
                }
            })
        },
        clearParagraphOutput: function (a) {
            b.sendNewEvent({
                op: "PARAGRAPH_CLEAR_OUTPUT",
                data: {
                    id: a
                }
            })
        },
        completion: function (a, c, d) {
            b.sendNewEvent({
                op: "COMPLETION",
                data: {
                    id: a,
                    buf: c,
                    cursor: d
                }
            })
        },
        commitParagraph: function (a, c, d, e, f) {
            b.sendNewEvent({
                op: "COMMIT_PARAGRAPH",
                data: {
                    id: a,
                    title: c,
                    paragraph: d,
                    config: e,
                    params: f
                }
            })
        },
        importNotebook: function (a) {
            b.sendNewEvent({
                op: "IMPORT_NOTE",
                data: {
                    notebook: a
                }
            })
        },
        checkpointNotebook: function (a, c) {
            b.sendNewEvent({
                op: "CHECKPOINT_NOTEBOOK",
                data: {
                    noteId: a,
                    commitMessage: c
                }
            })
        },
        isConnected: function () {
            return b.isConnected()
        }
    }
}]), angular.module("zeppelinWebApp").factory("websocketEvents", ["$rootScope", "$websocket", "$location", "baseUrlSrv", function (a, b, c, d) {
    var e = {};
    return e.ws = b(d.getWebsocketUrl()), e.ws.reconnectIfNotNormalClose = !0, e.ws.onOpen(function () {
        a.$broadcast("setConnectedStatus", !0), setInterval(function () {
            e.sendNewEvent({
                op: "PING"
            })
        }, 1e4)
    }), e.sendNewEvent = function (b) {
        void 0 !== a.ticket ? (b.principal = a.ticket.principal, b.ticket = a.ticket.ticket, b.roles = a.ticket.roles) : (b.principal = "", b.ticket = "", b.roles = ""), e.ws.send(JSON.stringify(b))
    }, e.isConnected = function () {
        return 1 === e.ws.socket.readyState
    }, e.ws.onMessage(function (b) {
        var d;
        b.data && (d = angular.fromJson(b.data));
        var e = d.op,
            f = d.data;
        "NOTE" === e ? a.$broadcast("setNoteContent", f.note) : "NEW_NOTE" === e ? c.path("notebook/" + f.note.id) : "NOTES_INFO" === e ? a.$broadcast("setNoteMenu", f.notes) : "AUTH_INFO" === e ? BootstrapDialog.alert({
            closable: !0,
            title: "Insufficient privileges",
            message: f.info.toString()
        }) : "PARAGRAPH" === e ? a.$broadcast("updateParagraph", f) : "PARAGRAPH_APPEND_OUTPUT" === e ? a.$broadcast("appendParagraphOutput", f) : "PARAGRAPH_UPDATE_OUTPUT" === e ? a.$broadcast("updateParagraphOutput", f) : "PROGRESS" === e ? a.$broadcast("updateProgress", f) : "COMPLETION_LIST" === e ? a.$broadcast("completionList", f) : "ANGULAR_OBJECT_UPDATE" === e ? a.$broadcast("angularObjectUpdate", f) : "ANGULAR_OBJECT_REMOVE" === e && a.$broadcast("angularObjectRemove", f)
    }), e.ws.onError(function (b) {
        a.$broadcast("setConnectedStatus", !1)
    }), e.ws.onClose(function (b) {
        a.$broadcast("setConnectedStatus", !1)
    }), e
}]), angular.module("zeppelinWebApp").factory("notebookListDataFactory", function () {
    var a = {};
    return a.list = [], a.setNotes = function (b) {
        a.list = angular.copy(b);
    }, a
}), angular.module("zeppelinWebApp").service("baseUrlSrv", function () {
    this.getPort = function () {
        var a = Number(location.port);
        return a || (a = 80, "https:" === location.protocol && (a = 443)), 3333 !== a && 9e3 !== a || (a = 8080), a
    }, this.getWebsocketUrl = function () {
        var b = "https:" === location.protocol ? "wss:" : "ws:";
        return b + "//" + location.hostname + ":" + this.getPort() + a(location.pathname) + "/ws"
    }, this.getRestApiBase = function () {
        return location.protocol + "//" + location.hostname + ":" + this.getPort() + a(location.pathname) + "/api"
    };
    var a = function (a) {
        return a.replace(/\/$/, "")
    }
}), angular.module("zeppelinWebApp").service("browserDetectService", function () {
    this.detectIE = function () {
        var a = window.navigator.userAgent,
            b = a.indexOf("MSIE ");
        if (b > 0) return parseInt(a.substring(b + 5, a.indexOf(".", b)), 10);
        var c = a.indexOf("Trident/");
        if (c > 0) {
            var d = a.indexOf("rv:");
            return parseInt(a.substring(d + 3, a.indexOf(".", d)), 10)
        }
        var e = a.indexOf("Edge/");
        return e > 0 ? parseInt(a.substring(e + 5, a.indexOf(".", e)), 10) : !1
    }
}), angular.module("zeppelinWebApp").service("SaveAsService", ["browserDetectService", function (a) {
    this.SaveAs = function (b, c, d) {
        if (a.detectIE()) {
            angular.element("body").append('<iframe id="SaveAsId" style="display: none"></iframe>');
            var e = angular.element("body > iframe#SaveAsId")[0].contentWindow;
            e.document.open("text/json", "replace"), e.document.write(b), e.document.close(), e.focus();
            var f = Date.now();
            e.document.execCommand("SaveAs", !1, c + "." + d);
            var g = Date.now();
            f === g && e.document.execCommand("SaveAs", !0, c + ".txt"), angular.element("body > iframe#SaveAsId").remove()
        } else {
            b = "data:image/svg;charset=utf-8," + encodeURIComponent(b), angular.element("body").append('<a id="SaveAsId"></a>');
            var h = angular.element("body > a#SaveAsId");
            h.attr("href", b), h.attr("download", c + "." + d), h.attr("target", "_blank"), h[0].click(), h.remove()
        }
    }
}]), angular.module("zeppelinWebApp").service("searchService", ["$resource", "baseUrlSrv", function (a, b) {
    this.search = function (c) {
        if (c.q) {
            var d = window.encodeURIComponent(c.q);
            return a(b.getRestApiBase() + "/notebook/search?q=" + d, {}, {
                query: {
                    method: "GET"
                }
            })
        }
    }
}]), angular.module("zeppelinWebApp").controller("LoginCtrl", ["$scope", "$rootScope", "$http", "$httpParamSerializer", "baseUrlSrv", function (a, b, c, d, e) {
    a.loginParams = {}, a.login = function () {
        c({
            method: "POST",
            url: e.getRestApiBase() + "/login",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: d({
                userName: a.loginParams.userName,
                password: a.loginParams.password
            })
        }).then(function (a) {
            b.ticket = a.data.body, angular.element("#loginModal").modal("toggle"), b.$broadcast("loginSuccess", !0)
        }, function (b) {
            a.loginParams.errorText = "The username and password that you entered don't match."
        })
    }
}]);