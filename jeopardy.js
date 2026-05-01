// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const gameName = document.createElement("h1");
gameName.textContent = "Jeopardy!";
document.body.appendChild(gameName);

const buttonStart = document.createElement("button");
buttonStart.textContent = "Start!";
buttonStart.addEventListener("click", () => {
  // load.hide(); Still connected to the entire board, no idea why
  setupAndStart();
  buttonStart.textContent = "Restart?";
});
document.body.appendChild(buttonStart);

let categories = [];
const NUM_CATEGORIES = 6;
const cat_count = 10;
const NUM_QUESTIONS_PER_CAT = 5;
let $loader;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  let res = await axios.get(
    `https://rithm-jeopardy.herokuapp.com/api/categories?count= ${cat_count}`,
  );
  const allCat = res.data;
  const randomCat = _.sampleSize(allCat, NUM_CATEGORIES);
  // console.log(randomCat.map(item => item.id));
  return randomCat.map((item) => item.id);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const res = await axios.get(
    `https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`,
  );
  console.log(res);
  const resData = res.data;
  const title = resData.title;
  const allClues = resData.clues;
  const randClues = _.sampleSize(allClues, NUM_QUESTIONS_PER_CAT);
  const clues = randClues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  const $board = $("#jeopardy");
  $board.empty();

  const $thead = $("<thead>");
  const $tr = $("<tr>");

  // const $table = $("<table>").attr("id", "jeopardy");
  // const $thead = $("<thead>");
  // const $tbody = $("<tbody>");

  // Create header row
  // const $headerRow = $("<tr>");
  for (let cat of categories) {
    $tr.append($("<th>").text(cat.title));
  }

  $thead.append($tr);
  $board.append($thead);

  const $tbody = $("<tbody>");
  for (let clueIdx = 0; clueIdx < NUM_QUESTIONS_PER_CAT; clueIdx++) {
    const $row = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      const $cell = $("<td>")
        .attr("data-cat", catIdx)
        .attr("data-clue", clueIdx)
        .text("?");
      $cell.click(handleClick);
      $row.append($cell);
    }
    $tbody.append($row);
  }
  $board.append($tbody);
  // Create clue rows
  // for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
  //   const $row = $("<tr>");

  //   for (let j = 0; j < NUM_CATEGORIES; j++) {
  //     const $cell = $("<td>")
  //       .text("?")
  //       .attr("data-cat", j)
  //       .attr("data-clue", i);

  //     $row.append($cell);
  //   }

  //   $tbody.append($row);
  // }

  // $table.append($thead).append($tbody);
  // $("body").append($table);

  // $("#jeopardy").on("click", "td", handleClick);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const $cell = $(evt.target);

  const catIdx = $cell.data("cat");
  const clueIdx = $cell.data("clue");

  const clue = categories[catIdx].clues[clueIdx];

  if (clue.showing === null) {
    $cell.text(clue.question);
    clue.showing = "question";
  } else if (clue.showing === "question") {
    $cell.text(clue.answer);
    clue.showing = "answer";
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#jeopardy").hide();
  if (!$loader) {
    $loader = $("<img>")
      .attr("src", "https://i.gifer.com/g0R9.gif")
      .attr("id", "loading");

    $("body").append($loader);
  }

  // load.hide(); For some reaason this hides the board, not the loading gif
}
$loader.show();

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  if ($loader) $loader.hide();
  $("#jeopardy").show();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();

  const oldTable = document.getElementById("jeopardy");
  if (oldTable) {
    oldTable.remove();
  }

  const catIds = await getCategoryIds();
  categories = await Promise.all(catIds.map((id) => getCategory(id)));

  const table = document.createElement("table");
  table.setAttribute("id", "jeopardy");
  // table.innerHTML = "<thead></thead><tbody></tbody>";
  document.body.appendChild(table);

  // for (let id of catIds) {
  //   const category = await getCategory(id);
  //   categories.push(category);
  // }

  await fillTable();
  hideLoadingView();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO

// async function start() {
//   const allIds = await getCategoryIds();
//   const id = allIds[0];
//   await getCategory(id);
// }

// start();

// buttonStart.click(setupAndStart);
// $(setupAndStart);
