class Wall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Pairs {
  constructor(a, b, dist) {
    this.origin = a;
    this.destination = b;
    this.distance = dist;
  }
}

var cur_stat;
var arrWall = new Array();
var intervalVisited;
var intervalPath;
var type = "";
var x_start = -1;
var y_start = -1;
var x_end = -1;
var y_end = -1;
var cost = [];
var queue = [];
var visited = [];
var final_path = [];
var visual_started = false;
var hor_length = 55;
var ver_length = 20;
var move_comp="";

function view_dropdown() {
  dropdown = document.getElementsByClassName("dropdown-menu")[0];
  if (dropdown.style.display == "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

//estrablishing functions and generating grid
function generate() {
  renew_arrays();
  stop_cycle();
  visual_started=false;
  document.getElementById("board").innerHTML = "";
  if (window.screen.availWidth < 600) {
    hor_length = 10;
    ver_length = 15;
    x_start = 2;
    y_start = 2;
    x_end = 8;
    y_end = 12;
    document.getElementById("scatter-btn").innerHTML="Scatter Obstacles";
  }
  //tablet potrait
  else if (window.screen.availWidth > 600 && window.screen.availWidth < 770) {
    hor_length = 21;
    ver_length = 20;
    x_start = 1;
    y_start = 1;
    x_end = 10;
    y_end = 10;
  }
  //desktop
  else {
    hor_length = 55;
    ver_length = 20;
    x_start = 12;
    y_start = 9;
    x_end = 42;
    y_end = 9;
    document.getElementById("scatter-btn").innerHTML="Scatter Random Obstacles";
  }
  for (i = 0; i < ver_length; i++) {
    var tag = document.createElement("tr");
    tag.setAttribute("id", "row " + i);
    document.getElementById("board").appendChild(tag);
    for (j = 0; j < hor_length; j++) {
      var tag = document.createElement("td");
      tag.setAttribute("class", "grid");
      tag.setAttribute("id", i + "-" + j);
      tag.addEventListener("click", function () {
        cur_stat = this.id;
        coords = this.id.split("-");
        y = parseInt(coords[0]);
        x = parseInt(coords[1]);
        
        if (
          (this.className == "grid" || this.className == "grid-transition") &&
          !visual_started && !move_comp
        ) {
          this.className = "wall";
          arrWall.push(new Wall(x, y));
        } else if((this.className == "grid" || this.className == "grid-transition") &&
        !visual_started && move_comp!=null){
          this.className = move_comp;
          if(move_comp == "start-node"){
            x_start = x;
            y_start = y;
          }
          else if(move_comp == "end-node"){
            x_end = x;
            y_end = y;
          }
          move_comp = "";
        }else if (this.className == "wall" && !visual_started) {
          this.className = "grid";
          for (var k = 0; k < arrWall.length; k++) {
            if (arrWall[k].x == x && arrWall[k].y == y) {
              arrWall.splice(k, 1);
            }
          }
        }else if(this.className == "start-node" && !visual_started){
          move_comp = "start-node";
          this.className="grid";
        }
        else if(this.className == "end-node" && !visual_started){
          move_comp = "end-node";
          this.className="grid";
        }
        console.log(move_comp); 
      });
      tag.addEventListener("mousedown", function () {
        cur_stat = this.id;
        elem = document.getElementById(cur_stat);
        type = elem.className;
      });
      tag.addEventListener("mouseenter", function () {
        if (mouseDown == true && !visual_started) {
          coords = this.id.split("-");
          y = parseInt(coords[0]);
          x = parseInt(coords[1]);
          if (this.id != cur_stat) {
            if (
              (this.className == "grid" ||
                this.className == "grid-transition") &&
              type != "start-node" &&
              type != "end-node"
            ) {
              this.className = "wall";
              arrWall.push(new Wall(x, y));
            } else if (this.className == "wall") {
              this.className = "grid";
              for (var k = 0; k < arrWall.length; k++) {
                if (arrWall[k].x == x && arrWall[k].y == y) {
                  arrWall.splice(k, 1);
                }
              }
            } else if (type == "start-node") {
              if (x != x_end || y != y_end) {
                start = document.getElementById(y_start + "-" + x_start);
                start.setAttribute("class", "grid");
                this.className = "start-node";
                x_start = x;
                y_start = y;
              }
            } else if (type == "end-node") {
              if (x != x_start || y != y_start) {
                end = document.getElementById(y_end + "-" + x_end);
                end.setAttribute("class", "grid");
                this.className = "end-node";
                x_end = x;
                y_end = y;
              }
            }
          }
          cur_stat = this.id;
        }
      });
      document.getElementById("row " + i).appendChild(tag);
    }
  }

  //initialize start

  start = document.getElementById(y_start + "-" + x_start);
  start.setAttribute("class", "start-node");

  end = document.getElementById(y_end + "-" + x_end);
  end.setAttribute("class", "end-node");

  initiate_matrix();
  // console.log(cost);

  var mouseDown = false;
  body = document.getElementById("board");
  body.addEventListener("mouseup", function () {
    mouseDown = false;
    cur_stat = null;
    type = null;
  });
  body.addEventListener("mousedown", function () {
    mouseDown = true;
  });
  cycle_view = document.getElementById("cycle_view");
  cycle_view.style.display = "none";
}

//matrix initiation
function initiate_matrix() {
  for (var from = 0; from < (hor_length*ver_length); from++) {
    cost.push([0]);
    for (var to = 0; to < (hor_length*ver_length); to++) {
      //constituting the coordinates from index and the adjacent squares
      coor_x = from % hor_length;
      coor_y = Math.floor(from / hor_length);
      index_top = (coor_y - 1) * hor_length + coor_x;
      index_left = coor_y * hor_length + coor_x - 1;
      index_right = coor_y * hor_length + coor_x + 1;
      index_bottom = (coor_y + 1) * hor_length + coor_x;

      if (from == to) cost[from][to] = 0;
      else if (to == index_top && coor_y > 0) cost[from][to] = 1;
      else if (to == index_left && coor_x > 0) cost[from][to] = 1;
      else if (to == index_right && coor_x < 54) cost[from][to] = 1;
      else if (to == index_bottom && coor_y < 19) cost[from][to] = 1;
      else cost[from][to] = 999;
    }
  }
  console.log(cost);
}

//reset function
function reset_grid() {
  //stopping animation
  stop_cycle();
  //renewing arrays
  renew_arrays();
  //resetting board state
  grid = document.getElementById("board").getElementsByTagName("td");
  for (var i = 0; i < grid.length; i++) {
    grid[i].setAttribute("class", "grid");
  }
  start = document.getElementById(y_start + "-" + x_start);
  start.setAttribute("class", "start-node");
  start = document.getElementById(y_end + "-" + x_end);
  start.setAttribute("class", "end-node");

  //reinitiate matrix
  initiate_matrix();
  //resetting visual state
  visual_started = false;
}
function renew_arrays() {
  queue = new Array();
  arrWall = new Array();
  visited = new Array();
  cost = new Array();
  final_path = new Array();
}
function toggle_cycle() {
  cycle_view = document.getElementById("cycle_view");
  if (cycle_view.style.display == "none") cycle_view.style.display = "block";
  else cycle_view.style.display = "none";
}
function stop_cycle() {
  if (intervalVisited) clearInterval(intervalVisited);
  if (intervalPath) clearInterval(intervalPath);
}
function scatter_wall() {
  if (!visual_started) {
    if (window.screen.availWidth < 600) {
      amount = 30
      buffer = 0;
    }
    //tablet potrait
    else if (window.screen.availWidth > 600 && window.screen.availWidth < 770) {
      amount = 60;
      buffer = 2;
    }
    //desktop
    else {
      amount = 100;
      buffer = 3;
    }
    for (var i = 0; i < amount; i++) {
      cand_x = Math.floor(Math.random() * (hor_length-buffer*2)) + buffer;
      cand_y = Math.floor(Math.random() * (ver_length-buffer*2)) + buffer;
      console.log(cand_y + "-" + cand_x);
      cand = document.getElementById(cand_y + "-" + cand_x);
      if (cand.className != "start-node" && cand.className != "end-node") {
        cand.setAttribute("class", "wall");
        arrWall.push(new Wall(cand_x, cand_y));
      }
    }
  } else {
    alert("Clear board first!");
  }
}
//establising walls in the matrix
function establish_walls(arrWall, cost) {
  arrWall.forEach(function (item) {
    point = item.y * hor_length + item.x;
    index_top = (item.y - 1) * hor_length + item.x;
    index_left = item.y * hor_length + item.x - 1;
    index_right = item.y * hor_length + item.x + 1;
    index_bottom = (item.y + 1) * hor_length + item.x;

    //handles top row
    if (item.y > 0) {
      cost[point][index_top] = 999;
      cost[index_top][point] = 999;
    }
    //handles left side
    if (item.x > 0) {
      cost[point][index_left] = 999;
      cost[index_left][point] = 999;
    }

    //handles right side
    if (item.x < hor_length-1) {
      cost[point][index_right] = 999;
      cost[index_right][point] = 999;
    }
    //handles bottom row
    if (item.y < ver_length-1) {
      cost[point][index_bottom] = 999;
      cost[index_bottom][point] = 999;
    }
  });
}
function trace_back(end_node, final_path) {
  traversed_node = end_node;
  while (traversed_node != start_node) {
    min_dist = 999;
    next_node = traversed_node;
    for (var i = visited.length - 1; i >= 0; i--) {
      if (visited[i].destination == traversed_node) {
        if (visited[i].distance < min_dist) {
          min_dist = visited[i].distance;
          next_node = visited[i].origin;
        }
      }
    }
    final_path.push(next_node);
    traversed_node = next_node;
  }
}
//// AI METHODS

//visualize visited
function visualize_visited(visited, final_path) {
  count = 0;
  timer = 1;
  if(window.screen.availWidth<600)
    timer = 15;
  else
    timer = 1;
  intervalVisited = setInterval(function () {
    y_temp = Math.floor(visited[count].destination / hor_length);
    x_temp = visited[count].destination % hor_length;
    color_visited = document.getElementById(y_temp + "-" + x_temp);
    if (
      color_visited.className != "start-node" &&
      color_visited.className != "end-node"
    )
      color_visited.setAttribute("class", "visited-node");
    count++;
    if (count == visited.length) {
      clearInterval(intervalVisited);
      visualize_path(final_path);
    }
  }, timer);
}
//visualize final_path
function visualize_path(final_path) {
  counter = 0;
  intervalPath = setInterval(() => {
    coor_x = final_path[counter] % hor_length;
    coor_y = Math.floor(final_path[counter] / hor_length);
    path_step = document.getElementById(coor_y + "-" + coor_x);
    if (
      path_step.className != "start-node" &&
      path_step.className != "end-node"
    )
      path_step.setAttribute("class", "final-path");
    counter++;
    if (counter == final_path.length) clearInterval(intervalPath);
  }, 30);
}

function dijkstra() {
  console.log(window.screen.availHeight + "x" + window.screen.availWidth);
  if (!visual_started) {
    //defining walls
    establish_walls(arrWall, cost);

    //disabling mouse actions
    visual_started = true;

    //initializing finish state
    start_node = y_start * hor_length + x_start;
    end_node = y_end * hor_length + x_end;

    active_node = start_node;
    cur_cost = 0;
    queue.push(new Pairs(active_node, active_node, 0));

    while (active_node != end_node) {
      //searching neighbors and establishing queues
      for (var i = 0; i < cost.length; i++) {
        if (cost[active_node][i] != 0 && cost[active_node][i] != 999) {
          // checking if already visited
          already_visited = false;
          for (var j = 0; j < visited.length; j++) {
            if (visited[j].origin == i) {
              already_visited = true;
              break;
            }
          }
          if (!already_visited) {
            //checking if already queued
            already_queued = false;
            perceived_distance = cost[active_node][i] + cur_cost;
            for (var j = 0; j < queue.length; j++) {
              if (queue[j].destination == i) {
                if (queue[j].distance > perceived_distance) {
                  queue.splice(j, 1);
                } else {
                  already_queued = true;
                }
                break;
              }
            }
            if (!already_queued) {
              queue.push(new Pairs(active_node, i, perceived_distance));
            }
          }
        }
      }
      //sorting the queue
      sorted = true;
      do {
        sorted = true;
        for (var i = 0; i < queue.length - 1; i++) {
          if (queue[i].distance > queue[i + 1].distance) {
            temp = queue[i];
            queue[i] = queue[i + 1];
            queue[i + 1] = temp;
            sorted = false;
          }
        }
      } while (!sorted);
      visited.push(queue[0]);
      // y_temp = Math.floor(queue[0].destination / 55);
      // x_temp = queue[0].destination % 55;
      // color_visited = document.getElementById(y_temp + "-" + x_temp);
      // if (color_visited.className != "start-node")
      //   color_visited.setAttribute("class", "visited-node");
      queue.splice(0, 1);
      try {
        active_node = queue[0].destination;
        cur_cost = queue[0].distance;
      } catch (error) {
        alert("Path not found! Clear board to restart!");
        break;
      }
    }
    //end node
    visited.push(queue[0]);
    final_path = [];
    final_path.push(end_node);

    //tracing the path
    trace_back(end_node, final_path);

    //visualization
    visualize_visited(visited, final_path);
  }
}
