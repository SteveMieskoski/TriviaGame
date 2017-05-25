$(document).ready(function () {

    var questions = [
        {
            question: 'Which is a fake SI unit?',
            answers: ['a siemens', 'a henry',
                'a weber', 'a flux'],
            answer_index: 3
        },
        {
            question: 'Which is Larger?',
            answers: ['Pluto', 'Titan (moon of Saturn)',
                'The Moon', 'Mercury', 'Ganymede (moon of Jupiter)'],
            answer_index: 4
        },
        {
            question: 'Which is Numerically Smaller?',
            answers: ['&#8463; (reduced Planck\'s constant)', '&#960;',
                'the number e', 'mass of an electron (energy equivalent)'],
            answer_index: 0
        }
        ,
        {
            question: 'Which is tallest from base to top?',
            answers: ['Mt. Everest', 'Mauna Kea',
                'Aconcagua', 'Denali (Mount Rainier)'],
            answer_index: 1
        },
        {
            question: 'Which Capital is the Highest?',
            answers: ['Bogotá, CO', 'Quito, EC' , 'Mexico City, MX',
                'Tehran, IR'],
            answer_index: 1
        }
    ];

    //=============================================================
    var times = {
        q: 10000,
        count: 1000,
        inter: 5000
    };


    window.setInterval(now, 1000); // Check for updating clock time
    now(); // set clock time

    start();

    function start() {
        $('#apple-button').on('click', function () {
            $('#main-game').slideDown();
            $('#start-page').slideUp();
            $(this).off('click');
            showQuestion(0, questions);
        });
    }



    function gameEnd() {
        console.log('complete');
        $('#game-end-bottom, #game-end-top, #play-again-label').slideDown();
        $('#main-game').slideUp();
        $('#apple-button').on('click', function () {
                $(this).off('click');
            $('#game-end-bottom, #game-end-top, #play-again-label').slideUp();
            $('#main-game').slideDown();
            showQuestion(0, questions);
            });
    }

    function showQuestion(id, questions) {
        if (id >= questions.length) {
            console.log('complete');
            gameEnd();
            return
        }
        console.log('qs', questions.length);
        $('.question').text(questions[id].question);
        for (var i = 0; i < questions[id].answers.length; i++) {
            var anAnswer = $('<h4>');
            anAnswer.html(questions[id].answers[i]);
            anAnswer.attr('id', i);
            anAnswer.addClass('activeAns');
            $('#answer').append(anAnswer);
        }
        answering(id, questions).then(function () {
            showQuestion(++id, questions);
        })
    }

    function answering(id, questions) {
        var deferred = $.Deferred();
        var game = $('#game'),
            toGo = $('.to-go'),
            correctAns = $('.correct-answer'),
            correctChoice = $('#correct'),
            interTime = $('.countDown'),
            incorrectChoice = $('#incorrect'),
            noChoice = $('#timeout');

        waitForAnswer(questions[id].answer_index)
            .done(function () {
                scoring(true);
                questionCleanup();
                game.slideUp();
                toGo.html((questions.length - 1) - id);
                correctAns.html(questions[id].answers[questions[id].answer_index]);
                correctChoice.slideDown();
                interTime.html((times.inter/1000));
                intermission(times.inter)
                    .then(function () {
                        game.slideDown();
                        correctAns.html("");
                        correctChoice.slideUp();
                        deferred.resolve();
                    })
                    .progress(function(){
                        var counter = +interTime.html() - 1;
                        interTime.html(counter)
                    });
            })
            .fail(function (reason) {
                    switch (reason) {
                        case 'incorrect':
                            scoring(false);
                            questionCleanup();
                            game.slideUp();
                            toGo.html((questions.length - 1) - id);
                            correctAns.html(questions[id].answers[questions[id].answer_index]);
                            incorrectChoice.slideDown();
                            interTime.html((times.inter/1000));
                             intermission(times.inter)
                                .then(function () {
                                    game.slideDown();
                                    correctAns.html("");
                                    incorrectChoice.slideUp();
                                    deferred.resolve();
                                })
                                 .progress(function(){
                                     var counter = +interTime.html() - 1;
                                     interTime.html(counter)
                                 });
                            break;
                        default:
                            scoring(false);
                            questionCleanup();
                            game.slideUp();
                            toGo.html((questions.length - 1) - id);
                            correctAns.html(questions[id].answers[questions[id].answer_index]);
                            noChoice.slideDown();
                            interTime.html((times.inter/1000));
                             intermission(times.inter)
                                .then(function () {
                                    game.slideDown();
                                    correctAns.html("");
                                    noChoice.slideUp();
                                    deferred.resolve();
                                })
                                 .progress(function(){
                                     var counter = +interTime.html() - 1;
                                     interTime.html(counter)
                                 });
                            break;
                    }
                }
            );
        return deferred.promise();
    }

    function waitForAnswer(correctId) {
        var deferred = $.Deferred();
        var QuestionTime = $('#countDown');
        QuestionTime.html((times.q/1000));
        var countDown = window.setInterval(function () {
            var counter = +QuestionTime.text() - 1;
            QuestionTime.text(counter)
        }, 1000);

        var timer = window.setTimeout(function () {
            clearInterval(countDown);
            deferred.reject('timeout');
        }, times.q);

        $('.activeAns').on('click', function () {
            console.log($(this)[0].id);
            if (Number.parseInt($(this)[0].id) === correctId) {
                clearTimeout(timer);
                clearInterval(countDown);
                deferred.resolve();
            } else {
                clearTimeout(timer);
                clearInterval(countDown);
                deferred.reject('incorrect');
            }
        });

        return deferred.promise();
    }


    function intermission(time) {
        var deferred = $.Deferred();
        setTimeout(function working() {
            if ( deferred.state() === "pending" ) {
                deferred.notify(-1);
                setTimeout( working, 1000 );
            }
        }, 1 );
        setTimeout(deferred.resolve, time);
        return deferred.promise();
    }

    function questionCleanup() {
        $('.activeAns').off('click');
        $('#answer').empty();
        $('#countDown').text(5);
    }

    function scoring(correct) {
        var score;
        if (correct) {
            score = +$('#wins').text() + 1;
            $('#wins').text(score);
        } else {
            score = +$('#losses').text() + 1;
            $('#losses').text(score);
        }
    }



    function now() {
        var now = new Date();
        var hr = now.getHours();
        var min = now.getMinutes();
        if (hr < 10) {
            hr = "0" + hr;
        }
        if (min < 10) {
            min = "0" + min;
        }
        var time = hr + ":" + min;
        $('.time').text(time);
    };


});