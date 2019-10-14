$(function() {
    // init page
    renderPage();

    //filtering
    $("#filter-search").on("input", function() {
        let inputText = $("input").val();
        let furigana = "";
        if (inputText) {
            $(".name").each((index, name) => {
                furigana = $(name).attr("data-kana");
                if (furigana.indexOf(inputText) !== -1) {
                    showRows(furigana);
                } else {
                    hideRows(furigana);
                }
            });
        } else {
            $(".name").each((index, name) => {
                furigana = $(name).attr("data-kana");
                showRows(furigana);
            });
        }
    });

    //show modal
    $("#myModal").on("show.bs.modal", function(event) {
        let button = $(event.relatedTarget);
        let name = button.data("name");
        let kana = button.data("kana");
        let id = button.data("id");
        let status = button.val();
        let modal = $(this);
        modal
            .find(".modal-body")
            .html(`<p>${name}(${kana})さんの</p>出席情報を変更します`);
        modal
            .find(".modal-footer .update-btn")
            .attr("id", id)
            .val(status);
    });

    //click modal
    $(document).on("click", ".update-btn", function() {
        let id = $(this).attr("id");
        let status = $(this).val();
        let targetButton = $('[data-id="' + id + '"]');
        $.ajax({
            type: "POST",
            url:
                "https://n0e4a2u7h9.execute-api.ap-northeast-1.amazonaws.com/default/wedding-lambda",
            data: {
                pageParam: "update",
                id: id,
                status: status
            }
        })
            .done(function(data) {
                $("body").removeClass("modal-open");
                $(".modal-backdrop").remove();
                $("#myModal").modal("hide");
                if (status === "1") {
                    //出席 → 出席済
                    targetButton
                        .removeClass("btn-danger")
                        .addClass("btn-secondary")
                        .html("出席済")
                        .val("0");
                } else {
                    //出席済 → 出席
                    targetButton
                        .removeClass("btn-secondary")
                        .addClass("btn-danger")
                        .html("出席")
                        .val("1");
                }
            })
            .fail(function(err) {
                console.log(err);
            });
    });
});

function renderPage() {
    $.ajax({
        type: "POST",
        url:
            "https://n0e4a2u7h9.execute-api.ap-northeast-1.amazonaws.com/default/wedding-lambda",
        data: {
            pageParam: "init"
        }
    })
        .done(function(data) {
            let list = createList(data);
            setTimeout(function() {
                $("#loader").remove();
                $("#wrap").append(list);
            }, 1500);
        })
        .fail(function(err) {
            console.log(err);
        });
}
function showRows(name) {
    $('.name[data-kana="' + name + '"')
        .parent()
        .show();
}

function hideRows(name) {
    $('.name[data-kana="' + name + '"')
        .parent()
        .hide();
}

function createList(data) {
    let html = "";
    html += '<div class="col-md-12 text-center"';
    html += 'style="margin: 0px 10px 0px 10px">';
    html += '<div class="row">';
    html += '<div class="col-12 contents-top"></div>';
    data.Items.map(function(val, index) {
        html += '<div class="col-12 list-rows"><div class="row">';
        html += '<div class="col-4 name list-contents contents-left"';
        html += " data-kana=" + val.kana + ">" + val.name + "</div>";
        html += '<div class="col-4 list-contents contents-center"';
        html += ">" + val.invite + "</div>";
        html += '<div class="col-4 list-contents contents-right"';
        html += '><button type="button"';
        if (val.flg === "0") {
            html += 'class="change-btn btn btn-danger"';
        } else {
            html += 'class="change-btn btn btn-secondary"';
        }
        html += 'data-target="#myModal"';
        html += 'data-name="' + val.name + '" data-kana="';
        html += val.kana + '" data-toggle="modal" data-id="' + val.id + '"';
        if (val.flg === "0") {
            html += ' value="1">出席</button>';
        } else {
            html += ' value="0">出席済</button>';
        }
        html += '</div></div></div><div class="col-12 contents-middle"></div>';
    });
    html += '<div class="col-12 contents-last"></div></div></div>';
    return html;
}
