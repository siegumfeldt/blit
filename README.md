The objective of Blit is to help BlitBot blit all the blits. You control BlitBot by writing Javascript code.

# Tutorial 1: Introduction (basic types and operators)

TODO: 
~~~javascript
2 + 2
2 < 5
"Bat + "man"
// Comment
~~~

# Tutorial 1: Moving around (function calls)

[LEVEL](https://siegumfeldt.github.io/blit/?startRow=2&startCol=2&cols=5&rows=6&pixels=------------o-----------------)

We'll start with making BB move one step forward. Type this in the editor on the left side of the screen,
then press `ctrl`+`enter` to run the code:

~~~javascript
move();
~~~

Here, `move` is name of a function a *function* - when we use it in our code, we're *calling* or *invoking* the function,
and this tells BB that we want it to move. All the functions that BB understands have verbs as their names, since
functions *do* things (like move, look and so on).

The semicolon marks the end of the statement. We could make BB move three steps by saying:

~~~javascript
move();move();move();
~~~

We need the empty parentheses after `move()` - leaving them out means that we're not calling the function but merely mentioning it:

~~~javascript
move; // Valid, but does nothing
~~~

So, what if we want BB to move backwards? We could try this:

~~~javascript
moveBackwards(); // ReferenceError: moveBackwards is not defined
~~~

This is reasonable, but it doesn't work (if you bring up the Javascript console (by pressing `ctrl`+`shift`+`I` in Chrome, you can see the error).

The problem is that BB's interface (the set of functions that we use to control BB) doesn't include a `moveBackwards()` function. Since moving forwards and backwards are both ways of moving around, we use the same function to talk to BB about it.

So, how does BB know what direction to move? We tell it, by using a *parameter value*:

~~~javascript
move("BACKWARD");
~~~

This is what the parentheses are for: providing *input* or *parameter values* when we call the function. By adding "`BACKWARD`" as a parameter value, we're telling BB what direction we want it to move. When we're calling `move()` with no parameter value, BB assumes that the value of the parameter should be `"FORWARD"` - that is  the *default value* of the parameter.

<!-- TODO: Parameter names -->

We can use a few different values for the parameter: BB understands "forward", "backward", "left" and "right" as well as "north", "east", "south" and "west" (casing doesn't matter). Forward is whatever direction BB is facing - north is up on your screen, regardless of what direction BB is facing.

We need the quotes around the parameter value




We'll need two more function to complete this first level:

- `blit()` - this blits the blit that BB is standing on. If BB is not standing on a blit, it does nothing. It takes no parameters.
- `reset()` - this resets the level. It is useful to start your scripts with this, so that you can rerun the entire thing.

Try writing a script that places BB on the blit and blits it.

<details>
  <summary>Solution</summary>

  This is one possible solution. You could use "FORWARD" or "NORTH" as the argument value for the first three calls or you could
  order the calls to `move()` differently:

  ~~~javascript
  move();
  move();
  move();
  move("RIGHT");
  move("RIGHT");
  blit();
  ~~~
  
</details>

- Calling (or invoking) a function
- Parameters and parameter values
- Default parameter values

# Tutorial 2: Moving around longer (loops and variables)

[level](https://siegumfeldt.github.io/blit?startCol=2&startRow=2&startDirection=NORTH&rows=26&cols=5&pixels=|-----|-----|--o--|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----)

In this level, BB need to move quite far (21 steps!) before blitting the sole blit.

That's easy! We just repeat `move()` 21 times!

~~~javascript

move();           move();     move();move();move();
move();move();    move();   move();           move();
move();  move();  move();   move();           move();
move();    move();move();     move();move();move();

blit();
~~~

It would nicer (and more readable) if we could say something like "move 21 steps". Unfortunately, the `move()` function does not take "the number of steps to move" as a parameter, it always just moves one step.
To make BB do the same thing many times, we'll have to use a *loop*:


~~~javascript
reset();

let stepsTaken = 0;
while(stepsTaken < 21) {
    move();
    stepsTaken = stepsTaken + 1;
}
blit();
~~~

In human-language: "Remember that you've taken 0 steps. While you've taken less than 21 steps, take a single step and remember that you've taken one more step. When you've taken the 21 steps, blit whatever you're standing on."

There are two new things here: A *variable* and *loop*.

## Variables

The `let` statement means that we're creating a new *variable* - a variable is a container for storing a value that might change. In this case it is the number of steps taken by BB, which starts out at zero.

The trick is that we can use the variable just like any specific value: When the condition `stepsTaken < 21` is checked, the program will see what value is stored in `stepsTaken` and check if it is less than 21.

<!--
We need the quotes around the parameter value, because the parameter value has to be piece of text (what programmers call a *string*).
This doesn't work:

~~~javascript
move(BACKWARD); // ReferenceError
~~~

It doesn't work because the parameter value we're using here is "the thing called `BACKWARD`", not the "the word `"BACKWARD"`", which is what we mean. This would work:

~~~javascript
let direction = "BACKWARD";
move(direction); 
~~~
-->

## The `while` loop

The second new thing is the `while` loop. It has to parts:

- a *condition* (`stepsTaken < 21`) which is checked once before each execution of the code block, and as soon as it is no longer true, the loop stops.
- a *block of code* (the two lines inside `{ }`) that gets executed each time the loop loops.

If we don't change `stepsTaken` inside the code block, the condition will always be true and the loop will never exit:

~~~javascript
reset();

let stepsTaken = 0;
while(stepsTaken < 21) {
    move();
}
blit();
~~~

(If you try running this, BB's internal command buffer will fill up, so your browser will not hang.)



# Tutorial : Turning


The really important this about functions is that we can make our own:

~~~javascript
function moveBackward() {
    move("BACK");
}

moveBackward();
~~~

# Tutorial: Moving without loops

~~~javascript
function moveMany(steps) {
    if(steps == 0) return
    move();
    moveMany(steps-1);
}

moveMany(21);
blit();
~~~


- Function declaration

~~~javascript
reset();
goFast();

function moveMany(direction, steps) {
    let stepsTaken = 0;
    while(stepsTaken < steps) {
        move(direction);
        stepsTaken += 1;
    }
}

function measure() {
    let stepsTaken = 0;
    while(!look("LEFT").isSolid) {
        move("LEFT");
        stepsTaken += 1;
    }
    blit();
    moveMany("RIGHT", stepsTaken);
    return stepsTaken;
}

while(look().isEmpty) {
    move();
    let steps = measure();
    moveMany("RIGHT", steps);
    blit();
    moveMany("LEFT", steps);
}
~~~
