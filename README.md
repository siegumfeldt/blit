# Blit

The objective of Blit is to help BlitBot blit all the blits. You control BlitBot by writing Javascript code.

## Functions: Moving around

[Level 1](https://siegumfeldt.github.io/blit/?startRow=2&startCol=2&cols=5&rows=6&pixels=------------o-----------------)

We'll start with something easy - making BB move one step forward. Type this in the editor on the left side of the screen,
then press `ctrl`+`enter` to run the code:

~~~javascript
move();
~~~

`move` is name of a function a *function* - when we use it in our code, we're *calling* og *invoking* the function,
and telling BB that we want it to move. All the functions that BB understands have verbs as their names, since
functions *do* things (like move, look and so on).

We need the parentheses - omitting them means that we're not *calling* the function but merely mentioning it:

~~~javascript
move; // Valid, but does nothing
~~~

So, what if we want BB to move backwards? We could try:

~~~javascript
moveBackwards(); // ReferenceError!
~~~

This would be reasonable, but it doesn't work (if you bring up the Javascript console (by pressing `ctrl`+`shift`+`I`, in Chrome, you can see the error).

The problem is that BB's interface (the set of functions that we use to control BB) doesn't include a `moveBackwards()` function.
Since moving forwards and backwards are closely related things (in fact, the same thing, only in opposite directions),
we use the same function to talk to BB about it.

So, how does BB know what direction to move? We tell it, by using a *parameter value*:

~~~javascript
move("BACKWARD");
~~~

This is what the parentheses are for: providing *input* or *parameter values* when we call the function. By adding "`FORWARD`" as a parameter value, we're telling
BB what direction we want it to move. When we're calling `move()` with no parameter value, BB assumes that the value of the parameter should be `"FORWARD"` -
we would say that `"FORWARD"` is the *default value* of the parameter or that the parameter "defaults to" `"FORWARD"`.

<!-- TODO: Parameter names -->

We can use a few different values for the parameter: BB understands "forward", "backward", "left" and "right" as well as "north", "east", "south" and "west"
(north is up on your screen, regardless of what direction BB is facing).

We'll need two more function to complete this first level:

- `blit()` - this blits the blit that BB is standing on. If BB is not standing on a blit, it does nothing. It takes no parameters.
- `reset()` - this resets the level. It is useful to start your scripts with this, so that you can rerun the entire thing.

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

## Loops: Looking around

Apart from moving and blitting, BB can also look around - this means you can say things
like "keep going until you hit a wall, then turn right".



~~~javascript
Math.sqrt(9)
~~~

## Loops: Moving longer

[Level 2](https://siegumfeldt.github.io/blit?startCol=2&startRow=2&startDirection=NORTH&rows=26&cols=5&pixels=|-----|-----|--o--|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----)

Here' we need to make BB move 21 steps. Easy!

~~~javascript

move();           move();     move();move();move();
move();move();    move();   move();           move();
move();  move();  move();   move();           move();
move();    move();move();     move();move();move();

blit();
~~~

It would nicer (and more readable) if we could say something like "move 21 steps". Unfortunately, the `move()` function does not
take a number of steps as a parameter, so we'll have to use a *loop*.

We'll use a "for" loop:




reset();
goFast();

for(let step=0; step<21; step++) {
    move();
}

blit();


## Functions: Turning





## Functions 3: 

The really important this about functions is that we can make our own:

~~~javascript
function moveBackward() {
    move("BACK");
}

moveBackward();
~~~



- Calling or invoking a function
- Parameters and parameter values
- Default value

- Function declaration
