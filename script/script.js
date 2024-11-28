import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, child, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
const firebaseConfig = {
    apiKey: "AIzaSyD5SBki4V8LQZXjp7C3DsEiBYdacEsp4Fo",
    authDomain: "quizproject-25be9.firebaseapp.com",
    databaseURL: "https://quizproject-25be9-default-rtdb.firebaseio.com",
    projectId: "quizproject-25be9",
    storageBucket: "quizproject-25be9.firebasestorage.app",
    messagingSenderId: "1071332852869",
    appId: "1:1071332852869:web:854172b309a243cb9095ec"
  };
  
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  
  document.addEventListener('DOMContentLoaded', function () {
    const btnOpenModal = document.querySelector('#btnOpenModal');
    const modalBlock = document.querySelector('#modalBlock');
    const closeModal = document.querySelector('#closeModal');
    const questionTitle = document.querySelector('#question');
    const formAnswers = document.querySelector('#formAnswers');
    const burgerBtn = document.getElementById('burger');
    const nextButton = document.querySelector('#next');
    const prevButton = document.querySelector('#prev');
    const sendButton = document.querySelector('#send');
    const modalDialog = document.querySelector('.modal-dialog');
  
    let clientWidth = document.documentElement.clientWidth;
    let questions = [];
    let selectedAnswers = [];
    let count = -100;
    let interval;
    let phoneNumber = '';
  
    //firebase
    const getData = () => {
      formAnswers.textContent = 'LOAD';
      
      const dbRef = ref(database, 'questions');
      get(dbRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            questions = snapshot.val();
            console.log(questions);
            playTest();
          } else {
            formAnswers.textContent = "No data available";
          }
        })
        .catch((error) => {
          formAnswers.textContent = "Ошибка загрузки данных";
          console.error('Error loading questions:', error);
        });
    };
  
    modalDialog.style.top = '-100%';
  
    const animateModal = () => {
      modalDialog.style.top = count + '%';
      count += 4;
      if (count < 0) {
        requestAnimationFrame(animateModal);
      } else {
        count -= 100;
      }
    };
  
    if (clientWidth < 768) {
      burgerBtn.style.display = "flex";
    } else {
      burgerBtn.style.display = 'none';
    }
  
    window.addEventListener('resize', function () {
      clientWidth = document.documentElement.clientWidth;
      if (clientWidth < 768) {
        burgerBtn.style.display = 'flex';
      } else {
        burgerBtn.style.display = 'none';
      }
    });
  
    burgerBtn.addEventListener('click', function () {
      burgerBtn.classList.add('active');
      modalBlock.classList.add('d-block');
      getData();
    });
  
    btnOpenModal.addEventListener('click', () => {
      requestAnimationFrame(animateModal);
      modalBlock.classList.add('d-block');
      getData();
    });
  
    document.addEventListener('click', function (event) {
      if (
        !event.target.closest('.modal-dialog') &&
        !event.target.closest('.openModalButton') &&
        !event.target.closest('.burger')
      ) {
        modalBlock.classList.remove('d-block');
        burgerBtn.classList.remove('active');
      }
    });
  
    closeModal.addEventListener('click', () => {
      modalBlock.classList.remove('d-block');
      burgerBtn.classList.remove('active');
    });
  
    const playTest = () => {
      let numberQuestion = 0;
  
      const renderAnswers = (index) => {
        formAnswers.innerHTML = '';
        formAnswers.classList.add('d-flex', 'flex-wrap', 'justify-content-center');
      
        questions[index].answers.forEach((answer) => {
          const answerItem = document.createElement('div');
          answerItem.classList.add('answers-item', 'd-flex', 'flex-column', 'align-items-center', 'm-3');
      
          answerItem.innerHTML = `
            <input type="${questions[index].type}" id="${answer.title}" name="answer" class="d-none">
            <label for="${answer.title}" class="d-flex flex-column justify-content-center align-items-center">
              <img src="${answer.url}" alt="${answer.title}" class="answer-img mb-2" style="width: 80px; height: auto;">
              <span>${answer.title}</span>
            </label>
          `;
      
          const inputElement = answerItem.querySelector('input');
          inputElement.addEventListener('change', () => {
            if (questions[index].type === 'radio') {
              selectedAnswers[index] = {
                question: questions[index].question,
                answer: answer.title
              };
            } else if (questions[index].type === 'checkbox') {
              if (!selectedAnswers[index]) {
                selectedAnswers[index] = {
                  question: questions[index].question,
                  answer: []
                };
              }
              if (inputElement.checked) {
                selectedAnswers[index].answer.push(answer.title);
              } else {
                const answerIndex = selectedAnswers[index].answer.indexOf(answer.title);
                if (answerIndex > -1) {
                  selectedAnswers[index].answer.splice(answerIndex, 1);
                }
              }
            }
          });
      
          formAnswers.appendChild(answerItem);
        });
      };
      
      
  
      const renderPhoneInput = () => {
        formAnswers.innerHTML = `
          <div class="form-group text-center">
            <label for="phoneNumber">Введите номер телефона:</label>
            <input type="tel" id="phoneNumber" class="form-control mt-2" placeholder="+380 (00) 00 00 00">
          </div>
        `;
      };
  
      const renderQuestions = (indexQuestion) => {
        if (questions[indexQuestion] && questions[indexQuestion].type === 'checkbox') {
          selectedAnswers[indexQuestion] = {
            question: questions[indexQuestion].question,
            answer: []
          };
        }
        switch (true) {
          case indexQuestion < questions.length:
            questionTitle.textContent = questions[indexQuestion].question;
            renderAnswers(indexQuestion);
  
            switch (indexQuestion) {
              case 0:
                prevButton.classList.add('hidden');
                break;
              default:
                prevButton.classList.remove('hidden');
            }
  
            nextButton.classList.remove('hidden');
            sendButton.classList.add('d-none');
            break;
  
          default:
            questionTitle.textContent = 'Введите номер телефона:';
            renderPhoneInput();
            nextButton.classList.add('hidden');
            sendButton.classList.remove('d-none');
            break;
        }
      };
  
      renderQuestions(numberQuestion);
  
      nextButton.onclick = () => {
        numberQuestion++;
        renderQuestions(numberQuestion);
      };
  
      prevButton.onclick = () => {
        numberQuestion--;
        renderQuestions(numberQuestion);
      };
  
      sendButton.onclick = () => {
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneNumber = phoneInput.value;
        }
    
        const resultsData = {
            phoneNumber: phoneNumber,
            answers: selectedAnswers
        };
    
        set(ref(database, 'results/' + Date.now()), resultsData)
            .then(() => {
                console.log("Results saved successfully.");
                renderResults(); 
                modalBlock.classList.remove('d-block');
                burgerBtn.classList.remove('active');
            })
            .catch((error) => {
                console.error("Error saving results: ", error);
            });
    };
    };
  
    const renderResults = () => {
        const existingResults = document.querySelector('.results-container');
        if (existingResults) {
          existingResults.remove();
        }
      
        const resultsContainer = document.createElement('div');
        resultsContainer.classList.add('results-container', 'p-3');
      
        selectedAnswers.forEach((item, index) => {
          const questionBlock = document.createElement('div');
          questionBlock.classList.add('question-block', 'mb-3', 'text-center');
      
          const questionTitle = document.createElement('h5');
          questionTitle.textContent = item.question;
          questionBlock.appendChild(questionTitle);
      
          const answersBlock = document.createElement('div');
          answersBlock.classList.add('answers-block', 'd-flex', 'justify-content-center', 'flex-wrap');
      
          if (Array.isArray(item.answer)) {
            item.answer.forEach((answer) => {
              const answerDetails = questions[index].answers.find(ans => ans.title === answer);
      
              const answerItem = document.createElement('div');
              answerItem.classList.add('answer-item', 'm-2', 'text-center');
              answerItem.innerHTML = `
                <img src="${answerDetails.url}" alt="${answer}" class="result-img mb-2" style="width: 100px; height: auto;">
                <p class="answer-text">${answer}</p>
              `;
              answersBlock.appendChild(answerItem);
            });
          } else {
            const answerDetails = questions[index].answers.find(ans => ans.title === item.answer);
      
            const answerItem = document.createElement('div');
            answerItem.classList.add('answer-item', 'm-2', 'text-center');
            answerItem.innerHTML = `
              <img src="${answerDetails.url}" alt="${item.answer}" class="result-img mb-2" style="width: 100px; height: auto;">
              <p class="answer-text">${item.answer}</p>
            `;
            answersBlock.appendChild(answerItem);
          }
      
          questionBlock.appendChild(answersBlock);
          resultsContainer.appendChild(questionBlock);
        });
      
        if (phoneNumber) {
          const phoneBlock = document.createElement('div');
          phoneBlock.classList.add('phone-block', 'mt-3', 'text-center');
          phoneBlock.innerHTML = `<h5>Ваш номер телефона: ${phoneNumber}</h5>`;
          resultsContainer.appendChild(phoneBlock);
        }
      
        document.body.appendChild(resultsContainer);
      };
      
  });
  