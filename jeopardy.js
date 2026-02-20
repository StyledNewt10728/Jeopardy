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

let categories = [];
const NUM_CATEGORIES = 6;
const cat_count = 10;
const NUM_QUESTIONS_PER_CAT = 5;

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
  const randClues = _.sampleSize(allClues, 5);
  return { title, randClues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $("body").empty();

  const $table = $("<table>").attr("id", "jeopardy");
  const $thead = $("<thead>");
  const $tbody = $("<tbody>");

  // Create header row
  const $headerRow = $("<tr>");
  for (let cat of categories) {
    $headerRow.append($("<th>").text(cat.title));
  }
  $thead.append($headerRow);

  // Create clue rows
  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    const $row = $("<tr>");

    for (let j = 0; j < NUM_CATEGORIES; j++) {
      const $cell = $("<td>")
        .text("?")
        .attr("data-cat", j)
        .attr("data-clue", i);

      $row.append($cell);
    }

    $tbody.append($row);
  }

  $table.append($thead).append($tbody);
  $("body").append($table);

  $("#jeopardy").on("click", "td", handleClick);
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

function showLoadingView() {}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  categories = [];

  const catIds = await getCategoryIds();

  for (let id of catIds) {
    const category = await getCategory(id);
    categories.push(category);
  }

  fillTable();
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

$(setupAndStart);
