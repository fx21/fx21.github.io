
var colors = ["purple","red","orange","yellow","white","rgb(146,208,80)","rgb(0,176,80)","rgb(82,121,52)","rgb(61,80,46)"]
var consequences = ["Enorma negativa konsekvenser","Stora negativa konsekvenser",
    "Måttliga negativa konsekvenser","Små negativa konsekvenser",
    "Inga eller obetydliga konsekvenser","Små positiva konsekvenser","Måttliga positiva konsekvenser",
    "Stora positiva konsekvenser","Enorma positiva konsekvenser"]

var colorMatrixSize = 5

var headers, categories
var cells

var editRow, editCol
var selectedColorRow, selectedColorCol

function Cell(element, row, col) {

    this.element = element
    this.row = row
    this.col = col

    this.colorRow = Math.floor(colorMatrixSize/2)
    this.colorCol = Math.floor(colorMatrixSize/2)

}

function setup_color_buttons(rows, cols) {

    rows = colorMatrixSize
    cols = colorMatrixSize

    for (var i = 0; i < rows; i++) {

        var rowObject = $('<tr/>')

        for (var j = 0; j < cols; j++) {

            var index = i - j + cols - 1

            var color = colors[index]
            var consequence = consequences[index]

            var cellObject = $('<td class="color-pick-cell" onclick="color_select_done(this)">&nbsp;</td>')

            cellObject.attr('data-row',i)
            cellObject.attr('data-col',j)

            cellObject.css("background-color",color)

            cellObject.text(consequence)

            rowObject.append(cellObject)

        }

        $("#color-select-table").append(rowObject)

    }


}

function clear_color_selection() {

    $('td.color-pick-cell').each( function() {

        $(this).removeClass("color-pick-selected")

    })

}

function add_color_selection(row, col) {

    $('td.color-pick-cell').each( function() {

        colorRow = parseInt($(this).attr('data-row'))
        colorCol = parseInt($(this).attr('data-col'))

        if (colorRow == row && colorCol == col) {

            $(this).addClass("color-pick-selected")

        }

    })

}

function color_select_done(element) {

    clear_color_selection()

    $(element).addClass("color-pick-selected")

    selectedColorRow = parseInt($(element).attr('data-row'))
    selectedColorCol = parseInt($(element).attr('data-col'))

}

function color_select(element) {

    row = parseInt($(element).attr('data-row'))
    col = parseInt($(element).attr('data-col'))

    var pickedHeader = headers[col+1]
    var pickedCategory = categories[row]

    $("#color-pick-title").text("Bedöm konsekvens för "+pickedCategory+" för "+pickedHeader)

    clear_color_selection()

    editRow = row
    editCol = col

    colorRow = cells[editRow][editCol].colorRow
    colorCol = cells[editRow][editCol].colorCol

    add_color_selection(colorRow, colorCol)

}

function color_select_complete() {

    var index = selectedColorRow - selectedColorCol + colorMatrixSize - 1
    var color = colors[index]

    cells[editRow][editCol].element.css("background-color",colors[index])

    cells[editRow][editCol].element.text(consequences[index])

    cells[editRow][editCol].colorRow = selectedColorRow
    cells[editRow][editCol].colorCol = selectedColorCol

}

function make_headers() {

    headerObject = $("#table-header")

    for (var i = 0; i < headers.length; i++) {

        thObject = $("<th/>")
        thObject.text(headers[i])

        headerObject.append(thObject)

    }

}

function add_row(title, row, num) {

    //var rowHtml = "<tr>"

    var rowObject = $('<tr/>')

    var rowHeader = $('<td/>')
    rowHeader.text(title)

    rowObject.append(rowHeader)

    for (var i = 0; i < num; i++) {

        var cellObject = $('<td class="color-cell" data-toggle="modal" data-target="#colorSelectModal" onclick="color_select(this)">-</td>')

        cellObject.attr('data-row',row)
        cellObject.attr('data-col',i)

        cells[row][i] = new Cell(cellObject, row, i)

        rowObject.append(cellObject)

    }

    $("#edit-table").append(rowObject)

}

function table_setup() {

    headers = ["Aspekter","Huvudalternativ","Alternativ 2","Alternativ 3","Nollalternativ"]
    categories = ["Naturmiljö", "Kulturmiljö", "Buller", "Jordbruksmark",
        "Vatten (yt- och grundvatten)","Olycksrisk"]

    cells = new Array(categories.length)

    for (var i = 0; i < categories.length; i++) {

        cells[i] = new Array(headers.length-1)

    }

    make_headers()

    for (var i = 0; i < categories.length; i++) {

        add_row(categories[i], i, headers.length-1)

    }

    setup_color_buttons()

}
